# 0011. Choosing between ambiguous places

## Status

Proposed (2026-10-15)

## Context

`SunCycle::GeocodingClient` takes the first geocoding result without telling the user. "Santiago" can be Santiago de Chile or Santiago de Compostela, and the response only echoes the text the user typed, so a wrong match goes unnoticed and the times look plausible.

## Options considered

1. **Keep the first result, but show the matched place:** return the display name and country of the match and show it above the table; the user can type a more specific name. Small change to the contract.
2. **Let the user pick:** a new endpoint (or a mode of the current one) returns a few candidates, and the frontend shows a list before searching. Clearer, but adds an endpoint, a UI step and more geocoding calls.
3. **Autocomplete while typing:** best experience, but many geocoding calls, which the Nominatim policy discourages (ADR 0010).

## Decision (proposed)

Option 1 first: add the matched place name to the response (contract v3, following the `api-contract` skill) and show it in the UI. Revisit option 2 if users still get the wrong place.

## Consequences

- The user sees which place the times belong to.
- The contract changes: backend, frontend type and `docs/api.md` move together.
- The geocoding cache must store the display name with the coordinates.
