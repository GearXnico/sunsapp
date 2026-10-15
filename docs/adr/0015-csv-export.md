# 0015. Export results to CSV

## Status

Proposed (2026-10-15)

## Context

People planning photos want the times in a spreadsheet or calendar. Today they can only read the table. The frontend already has every value it would export.

## Options considered

1. **Build the CSV (comma-separated values) in the browser:** a pure function turns the response into CSV and a button downloads it as a Blob; no API change.
2. **A `format=csv` option on the API:** works without the UI, but changes the contract and adds a second response type.

## Decision (proposed)

Option 1: `src/lib/csv.ts` (date, sunrise, sunset, golden_hour, utc_offset, plus the timezone in the file name or a header) and an "Export CSV" button under the table, with tests for quoting and empty times.

## Consequences

- No backend or contract change.
- Empty times export as empty cells, not "—".
- Values are written as text, so a location typed by the user cannot become a spreadsheet formula (escape cells that start with `=`, `+`, `-` or `@`).
