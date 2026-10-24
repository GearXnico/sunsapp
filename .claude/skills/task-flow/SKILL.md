---
name: task-flow
description: Use when starting, working on, or finishing a change (branch, commits, CHANGELOG, PR to develop) and after a PR is merged.
---

# task-flow

git-flow with rebase & merge as the only merge method (ADR 0002). One change = one branch = one PR.

**Hard rule: never merge, approve, or push to `develop` or `main` without the maintainer's explicit authorization and prior review.** The maintainer reviews and merges every PR. Do not force push to `develop` or `main`, ever.

## Start

1. Make sure the tree is clean: `git status`.
2. Update and branch from `origin/develop`:
   ```bash
   git fetch origin
   git switch -c <type>/<short-name> origin/develop
   ```
   Types: `feature/`, `fix/`, `refactor/`, `chore/`, `docs/`. Names are lowercase, hyphenated, 2 to 4 English words, e.g. `fix/request-validation`. `hotfix/*` branches from `origin/main` instead: its PR targets `main`, and after it is merged a second PR brings `main` back into `develop`. `release/*` is handled by the `release` skill.

## Work

1. Commit with Conventional Commits in English: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`. Each commit does one thing and leaves the tests green (rebase & merge keeps every commit on `develop`).
2. In a `fix/*` branch the first commit is a test that reproduces the bug (`test: reproduce ...`), then the fix.
3. Every `feature/*` comes with tests. If the task changes the `GET /api/sun_cycle` response, follow the `api-contract` skill. If it makes a technical decision, follow `new-adr`.
4. Tidy commits before the PR on your own branch only: `git rebase -i origin/develop`.

## Finish

1. Run the `check` skill until it is green, then the `security-pass` skill.
2. Add your entries under `## [Unreleased]` at the top of `CHANGELOG.md` (Added, Changed, Removed, Fixed, Security). Do not pick a version number; the `release` skill does that. Commit it as `docs: add <change> to unreleased changelog`.
3. Push your branch: `git push -u origin <type>/<short-name>`.
4. Open the PR to `develop` with the body from `.github/pull_request_template.md` (Before, After, How to test, Checklist) and the maintainer as reviewer:
   ```bash
   gh pr create --base develop --reviewer GearXnico --title "<type>: <summary>" --body-file <filled-template.md>
   ```
5. Share the PR link and stop. Do not merge it.

## After a PR is merged

Rebase every other open PR branch that is yours onto the new `develop`:

```bash
git fetch origin
git switch <your-branch>
git rebase origin/develop          # fix conflicts, rerun the check skill
git push --force-with-lease
```

Use `--force-with-lease` only on your own branches, never on `develop`, `main` or someone else's branch. If the rebase conflicts in `CHANGELOG.md`, keep both sides' entries under `Unreleased`.
