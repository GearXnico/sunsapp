# 0012. Rate limiting per IP

## Status

Accepted (2026-10-17)

## Context

`GET /api/sun_cycle` has no request limit. Once the app is public, one client can spend the SunriseSunset.io quota and break the Nominatim usage policy (1 request per second, ADR 0010), especially when the cache is empty (ADR 0009). Rails 8 ships `rate_limit` for controllers, backed by `Rails.cache`.

## Options considered

1. **`rate_limit` in `Api::SunCycleController`:** one line, per IP by default, no new dependency, answers 429 Too Many Requests.
2. **Rack::Attack:** more rules (throttles, blocklists), but a new gem for one endpoint.
3. **The hosting provider's limits or a proxy:** depends on the host chosen in ADR 0009, and not testable locally.

## Decision (proposed)

Use `rate_limit to: N, within: 1.minute` in the controller, with N = 20 requests per minute (chosen 2026-10-17, enough for a person searching and paging through days), and a 429 body `{ "error": "Too many requests" }` documented in `docs/api.md`. Add a controller test.

## Consequences

- External quotas are protected with no new dependency.
- Counters live in `Rails.cache`: they reset on restart and are per process, which is enough for one process.
- Clients behind the same IP share the limit.
- The frontend should show the 429 message like other errors.
