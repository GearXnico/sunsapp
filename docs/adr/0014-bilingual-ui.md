# 0014. Bilingual interface (Spanish and English)

## Status

Proposed (2026-10-15)

## Context

All UI text is in English and written inside the components. Nico and many likely users speak Spanish. API error messages are English strings that the UI shows as they come.

## Options considered

1. **Two JSON files (`src/i18n/es.json`, `src/i18n/en.json`) and a small hook:** no dependency, enough for one screen; the language comes from the browser and a toggle.
2. **A library such as react-i18next:** plurals, interpolation and lazy loading, which a single screen does not need.
3. **Keep English only.**

## Decision (proposed)

Option 1. The UI translates API errors by status and known message, and the API keeps English messages so the contract does not change. Dates and times keep their numeric format (`YYYY-MM-DD`, 24-hour).

## Consequences

- No hardcoded text in components; a test checks both files have the same keys.
- Adding a third language is a new JSON file.
- Moving to a library later is easy if the app grows.
