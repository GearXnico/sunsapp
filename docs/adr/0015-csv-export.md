# 0015. Export results to CSV

## Status

Accepted (2026-10-16). Proposed 2026-10-15.

## Context

People planning photos want the times in a spreadsheet or calendar. Today they can only read the table. The frontend already has every value it would export.

## Options considered

1. **Build the CSV in the browser:** a pure function turns the response into CSV and a button downloads it as a Blob; no API change.
2. **A `format=csv` option on the API:** works without the UI, but changes the contract and adds a second response type.

## Decision

Option 1: `src/lib/csv.ts` (date, sunrise, sunset, golden_hour, utc_offset, plus the timezone in the file name or a header) and an "Export CSV" button under the table, with tests for quoting and empty times.

## Consequences

- No backend or contract change.
- Empty times export as empty cells, not "—".
- Values are written as text, so a location typed by the user cannot become a spreadsheet formula (escape cells that start with `=`, `+`, `-` or `@`).

## Implementation notes

- The file name carries the time zone and the range: `sunsapp-<timezone-slug>-<start>-<end>.csv`, for example `sunsapp-america-santiago-2026-06-21-2026-06-22.csv`. Columns: `date,sunrise,sunset,golden_hour,utc_offset`.
- RFC 4180: comma separator, CRLF line endings, and double quotes around cells with a comma, a quote or a line break (inner quotes doubled).
- Formula escaping applies only to text cells: a text cell that starts with `=`, `+`, `-`, `@`, a tab or a carriage return gets a leading apostrophe (OWASP CSV injection). `utc_offset` is a number from the API and is written as a plain number, so `-180` stays numeric and cannot carry a formula.
- The button builds a Blob, downloads it through an object URL and revokes the URL right after the click.
