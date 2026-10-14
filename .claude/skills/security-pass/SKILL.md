---
name: security-pass
description: Use before asking for review of a PR, after the check skill is green; walks the security checklist on the branch diff.
---

# security-pass

Review the diff of the branch, not the whole repo: `git diff origin/develop...HEAD`. Report each item as OK, finding (file:line and the fix), or N/A.

1. **Inputs validated.** Every param of `GET /api/sun_cycle` (`location`, `start_date`, `end_date`) is checked for presence, type, format and range (max 366 days) and returns `400` with a clear message when invalid. No raw param reaches SQL, a shell, or a URL without validation or encoding.
2. **No internal details to clients.** Error responses never include `e.message`, backtraces, class names, SQL or upstream API bodies:
   ```bash
   git grep -nE 'e\.message|backtrace|inspect' -- backend/app
   ```
   Any hit inside a `render json:` is a finding. In the frontend, errors from the API are shown with fixed text, not raw objects.
3. **CORS origins from env.** `backend/config/initializers/cors.rb` reads allowed origins from an environment variable; no `origins "*"`:
   ```bash
   git grep -n 'origins' -- backend/config/initializers/cors.rb
   ```
4. **No secrets.** No API keys, tokens, `.env` files or `master.key` committed:
   ```bash
   git diff --name-only origin/develop...HEAD | grep -E '(^|/)\.env|master\.key|\.pem$'
   git diff origin/develop...HEAD | grep -nE '(api[_-]?key|secret|token|password)\s*[:=]' -i
   ```
5. **Dependency audits.**
   ```bash
   (cd backend && bundle exec bundler-audit check --update)
   (cd frontend && npm audit --audit-level=high)
   ```
6. **Brakeman.** `(cd backend && bin/brakeman --no-pager)` reports 0 warnings, or each one is explained in the PR.
7. **No personal data in logs.** Logs do not contain IPs, request headers or anything that identifies a person; `config/initializers/filter_parameter_logging.rb` covers any new sensitive param:
   ```bash
   git diff origin/develop...HEAD -- backend/app | grep -n 'logger'
   ```
8. **Containers non-root.** If a `Dockerfile` or `compose.yml` changed, the final image runs as a non-root `USER` and no secret is baked into the image.
9. **Outbound calls.** External HTTP clients set a timeout and, for Nominatim, the project User-Agent.

Finish with a one-line verdict: `security-pass: no findings` or the list of findings to fix before review.
