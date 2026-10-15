# 0002 · git-flow with rebase & merge, and no agent merges without authorization

- **Status:** Accepted
- **Date:** 2026-10-14

## Context

The history already follows git-flow: `develop`, `feature/front_branch`, `release/0.1.0`, `release/0.1.1`, `hotfix/fix_front_port` and `hotfix/fix_max-date`, merged with merge commits. From now on most changes are written by an AI (artificial intelligence) agent (Claude Code) and reviewed by Nico, so the flow must keep the history readable and make sure nothing reaches `develop` or `main` without his review.

## Options considered

1. **Keep git-flow with rebase & merge.** The branch model the repo already uses, with a linear history inside each branch.
2. **The portfolio rules with a `dev` branch.** Same idea under other names; it would mean renaming `develop` and breaking the existing history for no gain.
3. **Trunk-based development on `main`.** Fewer branches, but no integration branch and no release step before `main`; for a project with a single reviewer, a release branch is the simplest checkpoint before publishing.

## Decision

- Keep **git-flow**: `feature/*`, `fix/*`, `docs/*`, `chore/*` and `refactor/*` from `develop`; `hotfix/*` from `main`; `release/x.y.z` from `develop`.
- **Rebase & merge** is the only merge method. Each commit follows Conventional Commits, does one thing and leaves the tests green.
- One PR per plan task, targeting `develop`, with the PR template.
- **The agent never merges, approves or pushes to `develop` or `main` without Nico's explicit authorization and prior review.** It may use `git push --force-with-lease` only on its own branch.
- Versions follow SemVer (semantic versioning) in `CHANGELOG.md`: `feat` bumps MINOR, the rest bumps PATCH, MAJOR stays 0 until `1.0.0`.

## Consequences

- The history stays linear and each commit can be reverted or bisected on its own.
- Commits must be ordered and green before review, since they land as they are.
- When a PR merges, open PRs rebase on `develop` and may need to renumber their CHANGELOG version.
- Nico is the only one who merges, so his review is the bottleneck and the safety net.
- The old merge commits stay in the history; the new rule applies from this PR on.
