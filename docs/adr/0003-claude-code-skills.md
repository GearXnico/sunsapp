# 0003. Claude Code project skills

## Status

Accepted (2026-10-14, decision 8 of the planning log)

## Context

Most of the work on sunsapp is done in Claude Code sessions. Each session starts without memory, so the steps to set up the app, run the same checks as CI, open a PR, write an ADR, keep the API contract in sync, cut a release and review security were repeated by hand, or skipped. The time format bug between Rails and React came from one side of the `GET /api/sun_cycle` contract changing without the other.

Claude Code loads project skills from `.claude/skills/<name>/SKILL.md`: a short file with a `description` that says when to use it and the exact steps.

## Options considered

1. **Only `CLAUDE.md`.** One file with the rules and commands. Simple, but it grows with every workflow, is loaded in full in every session, and does not give a step-by-step procedure for a specific moment (release, contract change).
2. **Basic set of 4 skills** (`dev-setup`, `check`, `task-flow`, `new-adr`). Covers the daily loop, but leaves out the contract sync, the release and the security review, which are the steps that failed or would fail silently.
3. **Full set of 7 skills in the repo**: the basic 4 plus `api-contract`, `release` and `security-pass`.

## Decision

Option 3. The seven skills live in the repository under `.claude/skills/`, versioned and reviewed in PRs like code, so every session and every contributor uses the same procedure. `CLAUDE.md` keeps the rules and points to the skills; the skills hold the step-by-step commands.

## Consequences

- Every session follows the same steps for setup, checks, PRs, ADRs, contract changes, releases and security reviews.
- The skills name commands and paths, so they must change in the same PR as the thing they describe (for example, a new CI step updates `check`).
- Some commands are targets that exist only after later tasks (T3 CI and tests, T4 Vite, T6 `app/core/sun_cycle/`, T8 `compose.yml`, T9 `docs/api.md`); until then the skills describe the target state.
- Seven files to maintain instead of one; each is kept short to limit that cost.
