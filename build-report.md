# Build report

- **Blueprint:** blueprint.md @ 72c3ca9
- **Greenlight issue:** yangxdev/greenlight#3
- **Run:** https://github.com/yangxdev/agent-spend-cap/actions/runs/37054025254
- **Result:** ✅ complete

## Tasks

| # | Task | Status | Commit | Notes |
|---|------|--------|--------|-------|
| 1 | Estimate maths and URL codec | done | ad7236b | Also `fields.ts` (field limits, tool ids, `parseField`), shared by the codec and the slice |
| 2 | Estimate slice | done | 1492e39 | Adds `setTool` and selectors `selectInputs`, `selectEstimate`, `selectFieldErrors` |
| 3 | Config templates | done | cf4e0d1 | `capValues` helper in `render.ts` |
| 4 | Estimate section UI | done | 59b22c4 | `src/lib/format.ts` for USD formatting |
| 5 | Cap config section and share | done | f20946d | |
| 6 | Page, identity and limits | done | d2973d0 | README committed separately (`05c4490`) |

## Acceptance criteria

| Criterion | Covered by test | Status |
|-----------|-----------------|--------|
| AC1 | `src/features/estimate/estimate.test.ts` › "AC1: …" | pass |
| AC2 | `estimate.test.ts` › "AC2: …"; `estimateSlice.test.ts` › "AC2: …"; `EstimateSection.test.tsx` › "AC2: …" | pass |
| AC3 | `src/features/estimate/url.test.ts` › "AC3: round-trips valid inputs" | pass |
| AC4 | `url.test.ts` › "AC4: …" | pass |
| AC5 | `estimateSlice.test.ts` › "AC5: …" | pass |
| AC6 | `EstimateSection.test.tsx` › "AC6: …"; `estimateSlice.test.ts` › "AC6: …" | pass |
| AC7 | `src/features/cap-config/render.test.ts` › "AC7: …" (two tests) | pass |
| AC8 | `render.test.ts` › "AC8: …"; `CapConfigSection.test.tsx` › "AC8: …" | pass |
| AC9 | `render.test.ts` › "AC9: …"; `CapConfigSection.test.tsx` › "AC9: …" | pass |
| AC10 | `src/App.test.tsx` › "AC10: …" | pass |
| AC11 | `CapConfigSection.test.tsx` › "AC11: …" | pass |
| AC12 | `worker/worker.test.ts` › "GET /api/health returns ok …" (scaffold test, unchanged) | pass |

## Checks (last run of `npm run check`)

- lint: pass (ESLint, Prettier, style guard)
- test: pass (45 tests)
- build: pass (bundle size: 87 kB gzip JS, 6.8 kB gzip CSS)

## Deviations from the blueprint

- The scaffold's `HealthBadge` was removed from the page, since the blueprint's page has no API status. `healthSlice`, `HealthBadge` and `GET /api/health` are kept.
- `ConfigTemplate.id` is typed as `ToolId` (`'claude-code' | 'codex' | 'generic'`) rather than `string`, so the `tool` query value is validated against the same list.
- `decodeInputs` omits `capUsd` when the cap is absent (it returns a `Partial`), so a null cap round-trips as a missing key.
- Fields above their maximum are clamped when read from the URL, but typing one into the form shows an error instead of clamping silently.
- The URL is written only once the store has left its initial state, so opening a shared link never wipes it.

## New dependencies

None.

## Manual setup required before deploy

None for storage. As the blueprint's setup notes say, the owner should check each template in `src/features/cap-config/templates.ts` against the current Claude Code and Codex docs and then set `verifiedOn`, confirm the 826-agent figure against yangxdev/greenlight#3, and enable Cloudflare Web Analytics.

## Blockers / open questions

None. The Claude Code and Codex template settings and flag names were written from memory and are unchecked, as the blueprint expects. The page has not been checked visually at 320px or in both themes; the blueprint leaves that to the owner.
