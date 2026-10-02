# agent-spend-cap: blueprint

> Idea: yangxdev/greenlight#3 · One-line pitch: size the worst-case bill of an unattended coding-agent run before it starts, and get a copy-paste cap config for your own tool.

## Scope

- One screen, fully client-side. The Worker only serves the app and `GET /api/health`.
- The user types the model prices (USD per million input and output tokens) and the run shape: input and output tokens per turn, turns per agent, parallel agents, retries or loops per agent. No price feed, no defaults that look like real prices: the form starts empty except for an "Example run" button that fills illustrative numbers.
- Output: typical cost (the plan as typed) and worst-case cost (every agent retries), plus a "Reported fan-out" row that applies the same per-agent settings to 826 agents, the count described in the Hacker News thread, so the user sees how far a runaway fan-out can go.
- Every input lives in the query string, so the result is a shareable URL. No accounts, no history beyond the URL.
- Generates a cap config for the user's own tool: a max-turns value, a max-subagents value, and a hook snippet that stops a run at a spend figure. Templates are static text, labelled as unchecked examples.
- Core flow: type prices and run shape, read typical vs worst-case, pick a tool, copy the config or the link.

## Identity

- **Tag:** `agent run budgets`
- **Description:** Estimate the worst-case cost of an unattended coding-agent run and copy a spend-cap config for your own tool.
- **Headline:** `Know the worst case before the agents *start*.`
- **Sections:**
  - `01 Estimate`: the inputs and the typical, worst-case and fan-out results
  - `02 Cap config`: tool picker and the copy-paste max-turns, max-subagents and spend hook text
  - `03 Limits`: what the numbers do not cover and what to check before relying on them

## Data model

- **Storage:** none. State is the URL query string only; nothing is persisted in `localStorage` except the theme (handled by the template).
- No server data, no MongoDB, no R2.

```ts
// src/features/estimate/types.ts
export interface RunInputs {
  inPricePerM: number // USD per 1M input tokens
  outPricePerM: number // USD per 1M output tokens
  inTokensPerTurn: number
  outTokensPerTurn: number
  turnsPerAgent: number
  agents: number // parallel agents
  retries: number // extra full passes per agent in the worst case (0 = none)
  capUsd: number | null // optional spend cap; null = derive from worst case
}

export interface Estimate {
  costPerTurn: number
  typical: number
  worst: number
  fanOut: { agents: number; typical: number; worst: number }
}

// src/features/cap-config/templates.ts
export interface ConfigTemplate {
  id: string
  label: string
  /** Text with {{maxTurns}}, {{maxAgents}}, {{capUsd}} placeholders. */
  body: string
  /** ISO date a person checked this against the tool's docs. null = not checked. */
  verifiedOn: string | null
}
```

Query keys: `ip`, `op`, `it`, `ot`, `t`, `a`, `r`, `cap`, `tool`. Unknown or invalid values are ignored, negative and non-finite values rejected, and every field clamped to a sane maximum (e.g. agents ≤ 100000, tokens ≤ 10 million).

## Routes

| Kind | Path              | Purpose                                      | Request                                  | Response         |
| ---- | ----------------- | -------------------------------------------- | ---------------------------------------- | ---------------- |
| page | `/`               | The estimator; state in the query string     | optional `?ip=&op=&it=&ot=&t=&a=&r=&cap=&tool=` | –                |
| api  | `GET /api/health` | smoke test (keep)                            | –                                        | `HealthResponse` |

No `react-router`: one screen, and the query string is read and written with `URLSearchParams` and `history.replaceState`.

## Tasks

### Task 1: Estimate maths and URL codec

- **Do:** Pure functions in `src/features/estimate/`. `estimate(inputs): Estimate` with `costPerTurn = (inTokensPerTurn * inPricePerM + outTokensPerTurn * outPricePerM) / 1e6`, `typical = costPerTurn * turnsPerAgent * agents`, `worst = typical * (1 + retries)`, and `fanOut` = the same formulas with `agents` replaced by the exported constant `REPORTED_FAN_OUT = 826`. `encodeInputs(inputs): string` and `decodeInputs(search: string): Partial<RunInputs>` for the query string, with validation and clamping as described in the data model. Round-trip must be lossless for valid values. Export `EXAMPLE_RUN` (illustrative numbers, clearly not real prices).
- **Files:** `src/features/estimate/types.ts`, `src/features/estimate/estimate.ts`, `src/features/estimate/url.ts`, `src/features/estimate/estimate.test.ts`, `src/features/estimate/url.test.ts`
- **Satisfies:** AC1, AC2, AC3, AC4

### Task 2: Estimate slice

- **Do:** `estimateSlice` holding `RunInputs` as raw strings (so a half-typed field is not lost) plus a selector that parses them and returns `Estimate | null` (null while any required field is empty or invalid; prices, tokens, turns and agents are required, an empty `retries` counts as 0 and an empty `cap` as null). Actions: `setField`, `loadExample`, `hydrateFromSearch`. Register in `src/app/store.ts`. Initial state is all empty, `retries` empty, `tool` `generic`.
- **Files:** `src/features/estimate/estimateSlice.ts`, `src/features/estimate/estimateSlice.test.ts`, `src/app/store.ts`
- **Satisfies:** AC2, AC5, AC6

### Task 3: Config templates

- **Do:** `src/features/cap-config/templates.ts` exports three `ConfigTemplate`s: `claude-code`, `codex` and `generic` (a plain shell script reading a cumulative cost figure from a file and exiting non-zero above `{{capUsd}}`, to be wired into whatever hook the tool offers). Each has `verifiedOn: null`. Settings and flag names in the first two come from memory and are unchecked, so each body starts with a comment line `# Example only: check names against the tool's current docs`. `renderTemplate(template, { maxTurns, maxAgents, capUsd }): string` replaces placeholders; `capUsd` is formatted with two decimals. `suggestedCap(estimate, capUsd)` returns the user's cap if set, else `worst` rounded up to the next whole dollar. Max-turns equals `turnsPerAgent * (1 + retries)`, max-agents equals `agents`.
- **Files:** `src/features/cap-config/templates.ts`, `src/features/cap-config/render.ts`, `src/features/cap-config/render.test.ts`
- **Satisfies:** AC7, AC8, AC9

### Task 4: Estimate section UI

- **Do:** Build section `01 Estimate` with `Field` inputs (all `inputMode="decimal"`/`numeric`, labelled, with unit hints), an "Example run" `ghost` button, and results as `CellGrid`/`Stat`: Typical, Worst case, Reported fan-out (826 agents, worst). Below the stats, `Note`s: "Prices are the ones you typed. Nothing is fetched." and "Fan-out row uses 826 agents, the count described in one public report; it is not a forecast." Empty state (`EmptyState`): title "No estimate yet", line "Enter prices and a run shape, or load the example run." Costs formatted as USD with thousands separators, mono. Invalid fields show an error with `role="alert"`. Keep the URL in sync (`history.replaceState`) as inputs change, and hydrate from `location.search` on load.
- **Files:** `src/features/estimate/EstimateSection.tsx`, `src/features/estimate/useUrlSync.ts`, `src/features/estimate/EstimateSection.test.tsx`
- **Satisfies:** AC2, AC5, AC6, AC10

### Task 5: Cap config section and share

- **Do:** Section `02 Cap config`: `Segmented` tool picker (claude code, codex, generic), a `<pre>` (mono) showing the rendered config, an optional "Spend cap (USD)" `Field`, and the one `primary` Button "Copy config" (uses `navigator.clipboard.writeText`, then shows "Copied" in a `role="status"` region; falls back to selecting the text if the clipboard is unavailable). A `ghost` "Copy link" button copies `location.href`. Under the config, a `Note` reading "Unchecked example. Names and flags may be out of date, so check them against the tool's docs before relying on this." shown whenever `verifiedOn` is null, and "Checked on <date>" otherwise. Before an estimate exists, show an `EmptyState` ("Nothing to generate yet").
- **Files:** `src/features/cap-config/CapConfigSection.tsx`, `src/features/cap-config/CapConfigSection.test.tsx`
- **Satisfies:** AC7, AC8, AC9, AC11

### Task 6: Page, identity and limits

- **Do:** Set `SITE_NAME` `agent-spend-cap`, `SITE_TAG`, `SITE_DESCRIPTION` in `src/app/site.ts` from Identity. Compose `App.tsx`: `SiteHeader` with anchors, `Hero` with the headline (accent on `start`) and a lede "Type your model prices and the shape of the run. You get typical and worst-case cost, and a cap config to copy.", no hero action (the tool is right below), then `Section 01 Estimate`, `Section 02 Cap config` and `Section 03 Limits` (a `DetailList` or `RuledList` of: tokens per turn are averages and ignore context growth; no caching discounts or batch pricing; retries are whole extra passes; the estimate does not enforce anything; vendor prices change). `SiteFooter` notes: "Nothing leaves your browser. The only thing stored is your theme choice." Fill in `README.md` per `CLAUDE.md`, including Privacy. Build only with the shared components and tokens (no custom CSS, no fixed widths) so the page holds at 320px and in both themes; the owner checks it visually after deploy.
- **Files:** `src/app/site.ts`, `src/App.tsx`, `src/features/limits/LimitsSection.tsx`, `src/App.test.tsx`, `README.md`
- **Satisfies:** AC10, AC12

## Acceptance criteria

- **AC1:** Given price 3 in / 15 out per million, 1000 input and 500 output tokens per turn, 10 turns, 2 agents, 0 retries, when `estimate` runs, then `costPerTurn` is 0.0105, `typical` is 0.21 and `worst` equals `typical` (compared with `toBeCloseTo`, not exact float equality).
- **AC2:** Given any valid inputs, when `estimate` runs, then `worst = typical * (1 + retries)` and `fanOut.agents` is 826 with `fanOut.worst = costPerTurn * turnsPerAgent * 826 * (1 + retries)`. Tests assert the formula on several generated inputs, not one fixed total.
- **AC3:** Given valid `RunInputs`, when encoded with `encodeInputs` and decoded with `decodeInputs`, then the values are equal.
- **AC4:** Given a query string with a negative, non-numeric, infinite or oversized value, when decoded, then that field is omitted or clamped and no exception is thrown.
- **AC5:** Given an empty store, when the selector runs, then it returns null, and after `loadExample` it returns an `Estimate`.
- **AC6:** Given the page opened with `?ip=3&op=15&it=1000&ot=500&t=10&a=2&r=1`, when it renders, then the fields show those values and the worst-case figure is shown without any click; and when the user then changes a field, `location.search` is updated to contain the new value.
- **AC7:** Given a template and `{ maxTurns, maxAgents, capUsd }`, when rendered, then no `{{` placeholder remains and the cap appears with two decimals; and given 10 turns per agent, 3 retries and 4 agents, max-turns is 40 and max-agents is 4.
- **AC8:** Given an estimate with worst case 12.34 and no user cap, when the cap is suggested, then it is 13; given a user cap of 5, then it is 5.
- **AC9:** Given every template in `templates.ts`, when listed, then each has a non-empty body, and a `verifiedOn` of null renders the "Unchecked example" note.
- **AC10:** Given no inputs, when the page renders, then the headline, the "No estimate yet" empty state, all three numbered sections and the Example run button are visible.
- **AC11:** Given an estimate, when the user clicks "Copy config" with `navigator.clipboard.writeText` mocked, then it is called with the rendered config and "Copied" appears in a `role="status"` region.
- **AC12:** Given `GET /api/health`, when called through `worker.fetch`, then it returns `{ ok: true }` with status 200.

## Non-goals

- No live billing data, vendor API keys or connection to anyone's account.
- No price database or price feed; prices are typed in.
- No enforcement agent, proxy or daemon; v1 only estimates and generates text.
- No accounts, no saved history, no server storage, no custom analytics events.
- No modelling of context growth, prompt caching, batch discounts or per-vendor rate limits.
- No i18n, no routing, no PWA.

## Setup notes

No storage is needed: no R2 bucket, no MongoDB secret. Before the product is shared, the owner checks by hand:

1. Each config template in `src/features/cap-config/templates.ts` against the current docs of Claude Code and Codex (setting names, flags, hook points). Then set that template's `verifiedOn` to the check date.
2. That the 826-agent figure and its source thread still match the idea issue (yangxdev/greenlight#3), since the footnote cites it.
3. Enable Cloudflare Web Analytics for the Worker's `*.workers.dev` hostname.

## Success metric

In Cloudflare Web Analytics, watch unique visits and top referrers over the first 2 weeks after posting in Hacker News and the Claude Code and Codex GitHub discussions. Keep going at 200 or more unique visits, with visits to a URL carrying a query string (a shared estimate) from at least 10 different visitors. Copy clicks are not tracked, as the product sets no custom events.
