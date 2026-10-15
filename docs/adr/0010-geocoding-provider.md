# 0010. Geocoding provider

## Status

Proposed (2026-10-15)

## Context

The backend geocodes with Nominatim through the Geocoder gem (`config/initializers/geocoder.rb`). Nominatim's usage policy allows at most 1 request per second, asks for an identifying User-Agent and is not meant for heavy public use. Successful results are cached for 30 days (ADR 0017), which helps for repeated places but not for many new ones.

## Options considered

1. **Keep Nominatim:** free, no key, already in place; the limit can be hit if the app is public.
2. **A provider with an API key (for example a commercial geocoding API with a free quota):** higher limits and better ranking; adds a secret, an account and a possible cost.
3. **Self-hosted Nominatim:** no external limit; far too heavy for this app.

## Decision (proposed)

Keep Nominatim while the app is private or has few users. Move to a provider with an API key only if the app is published and the limit is reached; Geocoder supports several lookups, so the change stays in the initializer and an environment variable for the key.

## Consequences

- No new secret or service for now.
- A move needs Nico's approval (new external service) and a check of the provider's terms and quota in its official docs.
- Results (coordinates, ranking of ambiguous names) may change with the provider; see ADR 0011.
