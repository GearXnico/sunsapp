# 0013. Extended chart: golden hour bands and day length

## Status

Superseded by [0018](0018-day-sky-view.md) (2026-10-16). Proposed (2026-10-15).

## Context

The chart shows three lines (sunrise, sunset, start of the evening golden hour) on a fixed 00:00–24:00 local-time axis (ADR 0008). Bands for the golden hour and a day-length series were left out on purpose to keep the fix small. For someone planning photos, the window between the golden hour start and sunset, and how long the day is, are the useful parts.

## Options considered

1. **Filled band between golden hour and sunset, plus a day-length line on a second axis:** Chart.js supports both (`fill` between datasets, a second Y axis); no new dependency.
2. **Day length only in the table:** smallest change, no chart work.
3. **A different chart library:** not needed for these features.

## Decision (proposed)

Option 1, computed in `src/lib/chartData.ts` from the existing response (no API change). The morning golden hour is out of scope unless the API starts sending it.

## Consequences

- No contract change; tests stay on pure functions in `lib/`.
- Gaps (polar day or night, ADR 0006) must not draw a band across them.
- A second axis makes the chart busier on small screens; check it in the UI renewal (ADR 0016).
