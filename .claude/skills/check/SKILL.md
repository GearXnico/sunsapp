---
name: check
description: Use before every commit and before opening or updating a PR; runs exactly what CI runs and prints only a summary with the failures.
---

# check

Run the same checks as `.github/workflows/backend.yml` and `.github/workflows/frontend.yml`. If those workflows change, update this list to match them.

Rules:

- Run the areas in the order below and **stop at the first area that fails**. Report that area's failures and do not run the rest.
- Show only a summary: pass/fail per command, the coverage percentage, and the failing tests, offenses or advisories. Never paste the whole log.
- Never skip, disable or delete a test, a cop or an audit finding to make a check pass.

## 1. Backend (`cd backend`)

```bash
bin/rails db:test:prepare
bin/rails test                                  # SimpleCov; fails under 80 % line coverage
bin/rubocop
bin/brakeman --no-pager
bundle exec bundler-audit check --update
```

Summary to extract: `N runs, N assertions, N failures, N errors`, the coverage line, `N offenses detected`, Brakeman's `Security Warnings` count, and any `Name:`/`Advisory:` lines from bundler-audit.

## 2. Frontend (`cd frontend`)

```bash
npm ci
npm run lint
npm run typecheck
npm run test:coverage                           # Vitest; fails under 80 % line coverage
npm run build
npm audit --audit-level=high
```

Summary to extract: ESLint problem count, `tsc` errors (file:line), Vitest `Tests N passed | N failed` plus the coverage table total, build success, and the `found N vulnerabilities` line.

## 3. Report

One line per area, for example:

```
backend  PASS  tests 42/42, coverage 91.3 %, rubocop 0, brakeman 0, bundler-audit 0
frontend FAIL  typecheck: src/api/sunCycle.ts:12 TS2322 ...
```

Only report a check as green if you ran it in this session. If a tool cannot run here (no network, wrong local Ruby version), say which one and why.
