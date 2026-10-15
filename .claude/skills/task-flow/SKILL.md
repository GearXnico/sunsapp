---
name: task-flow
description: Use when starting, working on, or finishing a plan task (branch, commits, CHANGELOG, PR to develop) and after Nico merges a PR.
---

# task-flow

git-flow with rebase & merge as the only merge method (ADR 0002). One plan task = one branch = one PR.

**Hard rule: never merge, approve, or push to `develop` or `main` without Nico's explicit authorization and prior review.** Nico reviews and merges every PR. Do not force push to `develop` or `main`, ever.

## Start

1. Make sure the tree is clean: `git status`.
2. Update and branch from `origin/develop`:
   ```bash
   git fetch origin
   git switch -c <type>/<short-name> origin/develop
   ```
   Types: `feature/`, `fix/`, `refactor/`, `chore/`, `docs/`. Names are lowercase, hyphenated, 2 to 4 English words, e.g. `fix/request-validation`. `hotfix/*` branches from `origin/main` instead: its PR targets `main`, and after Nico merges it a second PR brings `main` back into `develop`. `release/*` is handled by the `release` skill.

## Work

1. Commit with Conventional Commits in English: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`. Each commit does one thing and leaves the tests green (rebase & merge keeps every commit on `develop`).
2. In a `fix/*` branch the first commit is a test that reproduces the bug (`test: reproduce ...`), then the fix.
3. Every `feature/*` comes with tests. If the task changes the `GET /api/sun_cycle` response, follow the `api-contract` skill. If it makes a technical decision, follow `new-adr`.
4. Tidy commits before the PR on your own branch only: `git rebase -i origin/develop`.

## Finish

1. Run the `check` skill until it is green, then the `security-pass` skill.
2. Add the version entry at the top of `CHANGELOG.md`: a branch with any `feat` commit bumps MINOR, otherwise bump PATCH, from the latest version in the file. Commit it as `docs: add <version> to changelog`.
3. Push your branch: `git push -u origin <type>/<short-name>`.
4. Open the PR to `develop` with the body from `.github/pull_request_template.md` (Before, After, How to test, Checklist) and Nico as reviewer:
   ```bash
   gh pr create --base develop --reviewer GearXnico --title "<type>: <summary>" --body-file <filled-template.md>
   ```
5. Share the PR link and stop. Do not merge it.

## After Nico merges a PR

Rebase every other open PR branch that is yours onto the new `develop`:

```bash
git fetch origin
git switch <your-branch>
git rebase origin/develop          # fix conflicts, rerun the check skill
git push --force-with-lease
```

Use `--force-with-lease` only on your own branches, never on `develop`, `main` or someone else's branch. If the rebase changes a CHANGELOG version that is now taken, bump it.
