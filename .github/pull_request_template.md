<!-- One PR per plan task, targeting `develop`. Nico reviews and merges (rebase & merge). -->

## Before

<!-- How things worked (or failed) before this PR. -->

## After

<!-- What changes with this PR. Link the plan task (T#) and any ADR. -->

## How to test

<!-- Exact commands and manual steps to verify the change. -->

## Checklist

- [ ] Tests green (`bin/rails test`, `npm test`); no test hits the network
- [ ] Coverage ≥ 80 % (backend and frontend)
- [ ] Lint and typecheck green (`bin/rubocop`, `npm run lint`, `npm run typecheck`)
- [ ] Audits green (`bin/brakeman --no-pager`, `bundle exec bundler-audit check --update`, `npm audit --audit-level=high`)
- [ ] `CHANGELOG.md` has this PR's entries under `Unreleased`
- [ ] ADR and docs updated if a decision, command or convention changed
- [ ] No secrets, `.env` files or personal data in the diff or the logs
