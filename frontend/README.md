# sunsapp frontend

React 19 + TypeScript (strict) app built with Vite. One screen: a search form, then a day sky view (24-hour band, sun's arc and stages of one day, with Prev/Next), a table of every day and a Chart.js chart behind a "See variation" button, in the local time of the place.

## Run

```bash
npm ci
npm run dev                 # http://localhost:3001
```

It expects the backend on `http://localhost:3000`; to use another one, set `VITE_API_URL` (see `.env.example`). Or run the whole app from the repo root with `docker compose up`. The Node version is in `.nvmrc`.

## Code

```
src/App.tsx                  the screen and its state (results, loading)
src/components/              SearchForm, Results, DayView, SkyBand, StageList, ResultsChart, ExportCsvButton, ErrorMessage, LoadingScreen
src/api/client.ts            fetchSunCycle(): the only place that knows the API URL
src/api/types.ts             SunCycleResponse and SunCycleDay (contract v3, docs/api.md)
src/lib/time.ts              parse and format "HH:MM" times and UTC offsets
src/lib/chartData.ts         API days -> Chart.js datasets (null times become gaps)
src/lib/csv.ts               results -> CSV text and file name (RFC 4180, formula escaping)
src/lib/dayView.ts           stages of a day, day length and the sky band's text alternative
src/test/                    Vitest setup and shared fixtures
```

Components never call axios directly; they go through `src/api/client.ts`. Chart decisions: [ADR 0008](../docs/adr/0008-chart-time-axis.md); day sky view: [ADR 0018](../docs/adr/0018-day-sky-view.md). Why Vite and TypeScript: [ADR 0005](../docs/adr/0005-vite-typescript.md).

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
