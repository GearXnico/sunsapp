# 0005. Vite and TypeScript for the frontend

## Status

Accepted (2026-10-14)

## Context

The frontend was a Create React App (CRA) project on `react-scripts` 5. CRA is deprecated, no
longer receives updates and pulls in dependencies with known vulnerabilities, so
`npm audit --audit-level=high` fails and cannot be used as a CI gate.

The app was plain JavaScript. The chart bug comes from an unchecked assumption about the API
response: `parseTime` expects `"HH:MM"`, but nothing states or checks the format the backend
sends. A typed contract between the API client and the components makes that shape explicit.

The project is part of a portfolio, so it should also show React skills.

## Options considered

1. **Vite with TypeScript (strict).** Maintained, fast dev server and build, first-class Vitest
   integration. TypeScript makes the API response (`SunCycleDay`) an explicit type.
2. **Vite with JavaScript.** Same tooling and fixes the audit, but the API contract stays implicit.
3. **Keep CRA.** No migration cost, but the audit keeps failing and the tooling is unmaintained.

## Decision

Option 1: React stays, built with Vite, in TypeScript with `strict` enabled. Tests use Vitest,
jsdom and Testing Library, with an 80 % line coverage gate. ESLint uses the flat config with
typescript-eslint, react-hooks and react-refresh. The API URL comes from `VITE_API_URL`.

TypeScript is pinned to 6.0.x because typescript-eslint does not support TypeScript 7 yet.

## Consequences

- `npm audit --audit-level=high` passes and runs in CI with lint, typecheck, tests and build.
- The API response has a single type in `src/api/types.ts`; when the backend contract changes
  (for example adding the time zone), the compiler points at every place to update.
- The dev command changes from `npm start` to `npm run dev` (still on port 3001), and the build
  output moves from `build/` to `dist/`.
- TypeScript moves to 7.x once typescript-eslint supports it.
