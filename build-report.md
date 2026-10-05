# Build report

- **Blueprint:** blueprint.md @ 72c3ca9 (change spec changes/13.md)
- **Greenlight issue:** yangxdev/greenlight#13
- **Run:** https://github.com/yangxdev/agent-spend-cap/actions/runs/37304639629
- **Result:** ✅ complete

## Tasks

| # | Task | Status | Commit | Notes |
|---|------|--------|--------|-------|
| 1 | Inputs, Estimate and Limits panes | done | a631819 | `useUrlSync` is no longer called from these components |
| 2 | Cap config pane and a shared copy hook | done | 4d7f675 | `src/lib/useCopy.ts`; the pane has only Copy config (ghost) and no status region |
| 3 | The Estimate screen and the app shell | done | 4e0ffd5 | Old `*Section` files and their tests deleted. `src/App.test.tsx` was rewritten here, not in Task 4, because the old AC10 test could not pass once the hero was gone |
| 4 | App test and README | done | 4161fc3 | Screen-level tests for CH3, CH5, CH6 live in `src/App.test.tsx`; README steps renamed to the panes |

## Acceptance criteria

| Criterion | Covered by test | Status |
|-----------|-----------------|--------|
| CH1 | `src/App.test.tsx` › "CH1: …" | pass |
| CH2 | `src/App.test.tsx` › "CH2: …" | pass |
| CH3 | `src/App.test.tsx` › "CH3: …" | pass |
| CH4 | `src/App.test.tsx` › "CH4: …"; `src/features/cap-config/CapConfigPane.test.tsx` › AC8, AC9 | pass |
| CH5 | `src/App.test.tsx` › "CH5: …" (two tests); `CapConfigPane.test.tsx` › AC11 | pass |
| CH6 | `src/App.test.tsx` › "CH6: …"; `src/features/estimate/EstimatePanes.test.tsx` › AC5 | pass |
| CH7 | `src/features/estimate/EstimatePanes.test.tsx` › "CH7: …" | pass |
| CH8 | `src/App.test.tsx` › "CH8: …" | pass |
| CH9 | `worker.test.ts`, `estimate.test.ts`, `url.test.ts`, `estimateSlice.test.ts`, `render.test.ts`, `healthSlice.test.ts`, `ui.test.tsx`, unedited | pass |

## Checks (last run of `npm run check`)

- lint: pass
- test: pass (all test files green)
- build: pass (bundle size: 87.2 kB gzip JS, 7.2 kB gzip CSS)

## Deviations from the blueprint

The change replaces the blueprint's `page` layout (hero, numbered sections) with the `app` layout, as changes/13.md specifies. Tests changed because behaviour changed: the old AC10 test (hero and section headings) became CH1, and the `EstimateSection` / `CapConfigSection` tests were ported to the panes. The AC6 test became CH3 and the clipboard status tests became CH5, both at screen level. The "Spend cap (USD)" field and the Limits intro line ("Check these before relying on an estimate.") sit where the spec allowed: the intro line is the Limits pane's `aside`.

## New dependencies

None

## Manual setup required before deploy

None. After deploy, check by hand at 320px and in both themes that nothing scrolls sideways and that the pane order on a phone is Inputs, Estimate, Cap config, Limits. The owner should also confirm that the new-issue page of the product repo is where "Suggest a change" should point.

## Blockers / open questions

None
