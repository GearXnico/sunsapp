---
name: api-contract
description: Use whenever a change touches the request or response of GET /api/sun_cycle, so backend, frontend, tests and docs change together.
---

# api-contract

The JSON of `GET /api/sun_cycle` is a contract between Rails and React. Change every side in the same PR so they never drift apart again (the time format bug came from that).

1. Write down the change first: field added, renamed, removed, or its format (for example `sunrise` as `HH:MM` 24 h plus `timezone`). Removing or renaming a field is a breaking change: ask the maintainer before doing it.
2. Backend response, in `backend/`:
   - The controller `app/controllers/api/sun_cycle_controller.rb` builds the response.
   - The logic lives in `app/core/sun_cycle/` (`query.rb`, `lookup.rb`, the clients).
   - If a cached field changes, bump the cache key version in `lookup.rb` so old entries are not read.
3. Frontend type, in `frontend/src/api/`: update the `SunCycleDay` type and the client that parses the response. Fix every compile error that `npm run typecheck` shows; do not use `any` or casts to silence them.
4. Tests on both sides:
   - Backend: controller test in `backend/test/controllers/api/` asserting the exact JSON keys and formats, and core tests in `backend/test/core/sun_cycle/`. External APIs are stubbed with WebMock; no test hits the network.
   - Frontend: tests of the API client and of the components that read the changed field, with fixtures that match the new backend JSON exactly.
5. Docs: update the request/response example and the field table in `docs/api.md`.
6. Verify the set is complete:
   ```bash
   git diff --stat origin/develop -- backend/app backend/test frontend/src/api frontend/src docs/api.md
   ```
   All four areas (backend code, backend tests, frontend type and tests, `docs/api.md`) must appear. Then run the `check` skill.
7. In the PR "After" section, paste one example response.
