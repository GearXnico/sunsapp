# 0008. Chart.js with a fixed local-time axis

## Status

Accepted (2026-10-14)

## Context

The results chart parsed times by splitting on `:`. With the old API formats it drew wrong data:
ISO 8601 strings (`2026-06-21T05:41:58-04:00`) gave `NaN` and an empty chart, and 12-hour times
(`8:38 PM`) ignored AM/PM, so the sunset was drawn on top of the sunrise. The Y axis scaled to
the data, so the same time sat at a different height for each search, and nothing said which time
zone the times were in. The "Golden Hour" label hid that the API value is the start of the
evening golden hour.

Since contract v2 (ADR 0006) the API sends 24-hour `HH:MM` times local to the place, with the
IANA zone and a UTC offset per day, and `null` when there is no sunrise or sunset.

## Options considered

1. **Keep Chart.js and fix the axis.** Strict parsing, times as minutes since midnight on a fixed
   0–24 h axis in the place's zone, zone in the axis title, tooltip and table. Smallest change; the
   current look and colors stay.
2. **Extended chart.** Golden hour as bands, day length, morning and evening golden hours. More
   useful, but it is new scope, not a fix (left for ADR 0013).
3. **Switch library** (for example Recharts or a time-series library). A rewrite of the chart and
   a new dependency to fix a parsing bug.

## Decision

Option 1. `parseTime` accepts only `H:MM` or `HH:MM` (optional `:SS`) and returns `null` for
anything else, so a format change shows as a gap and never as a wrong point. The chart maps days
with a pure `buildChartData` function, uses a fixed Y axis from 0 to 1440 minutes with ticks every
3 hours, leaves gaps for `null` (`spanGaps: false`) and labels the series "Golden hour (evening)".
The table shows "Times in <zone> (<UTC offset>)", or the offset per row when it changes inside
the range (DST, daylight saving time), and "—" for missing times.

## Consequences

- The chart and table always show the place's local time, labelled with its zone.
- Times are compared on the same scale across searches; a DST change shows as a one-hour step,
  which is the real local time.
- Unknown formats fail visibly (gaps), and unit tests cover parsing and the data mapping.
- Bands and day length stay for ADR 0013; a new UI design stays for ADR 0016.
