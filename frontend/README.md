# sunsapp frontend

React 19 + TypeScript (strict) app built with Vite. One screen: a search form, then a table and a Chart.js chart of the sunrise, sunset and evening golden hour of each day, in the local time of the place.

## Run

```bash
npm ci
npm run dev                 # http://localhost:3001
```

It expects the backend on `http://localhost:3000`; to use another one, set `VITE_API_URL` (see `.env.example`). Or run the whole app from the repo root with `docker compose up`. The Node version is in `.nvmrc`.

## Code

```
src/App.tsx                  the screen and its state (results, loading)
src/components/              SearchForm, Results, ResultsChart, ErrorMessage, LoadingScreen
src/api/client.ts            fetchSunCycle(): the only place that knows the API URL
src/api/types.ts             SunCycleResponse and SunCycleDay (contract v2, docs/api.md)
src/lib/time.ts              parse and format "HH:MM" times and UTC offsets
src/lib/chartData.ts         API days -> Chart.js datasets (null times become gaps)
src/test/                    Vitest setup and shared fixtures
```

Components never call axios directly; they go through `src/api/client.ts`. Chart decisions: [ADR 0008](../docs/adr/0008-chart-time-axis.md). Why Vite and TypeScript: [ADR 0005](../docs/adr/0005-vite-typescript.md).

## Tests and checks

```bash
npm test                    # Vitest + Testing Library
npm run test:coverage       # fails below 80 % of lines
npm run lint
npm run typecheck
npm run build               # type-checks and writes the static site to dist/
npm audit --audit-level=high
```

Tests mock the API client, so they never hit the network. Test files sit next to the code (`*.test.ts(x)`).
