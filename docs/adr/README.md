# Architecture decision records

Each ADR records one decision: its context, the options considered, the decision and its consequences. **Accepted** ADRs are decided by Nico and describe the code; **Proposed** ADRs are future improvements, documented but not built. Write new ones with the `new-adr` skill (`.claude/skills/new-adr/SKILL.md`); never change an accepted decision without a new ADR that supersedes it.

| # | Title | Status |
|---|---|---|
| [0001](0001-monorepo-rails-api-react.md) | Monorepo with a Rails API backend and a React frontend | Accepted |
| [0002](0002-git-flow-rebase-merge.md) | git-flow with rebase & merge, and no agent merges without authorization | Accepted |
| [0003](0003-claude-code-skills.md) | Claude Code project skills | Accepted |
| [0004](0004-tests-and-ci.md) | Tests and CI | Accepted |
| [0005](0005-vite-typescript.md) | Vite and TypeScript for the frontend | Accepted |
| [0006](0006-local-time-of-place.md) | Local time of the place | Accepted |
| [0007](0007-sqlite-cache-and-range-limit.md) | SQLite cache and range limit | Accepted; cache part superseded by 0017 |
| [0008](0008-chart-time-axis.md) | Chart.js with a fixed local-time axis | Accepted; chart behind a button since 0018 |
| [0009](0009-free-deployment.md) | Free deployment | Proposed |
| [0010](0010-geocoding-provider.md) | Geocoding provider | Proposed |
| [0011](0011-ambiguous-places.md) | Choosing between ambiguous places | Accepted |
| [0012](0012-rate-limiting.md) | Rate limiting per IP | Accepted |
| [0013](0013-extended-chart.md) | Extended chart: golden hour bands and day length | Superseded by 0018 |
| [0014](0014-bilingual-ui.md) | Bilingual interface (Spanish and English) | Proposed |
| [0015](0015-csv-export.md) | Export results to CSV | Accepted |
| [0016](0016-ui-renewal.md) | User interface renewal | Proposed |
| [0017](0017-rails-cache-for-sun-times-and-geocoding.md) | Rails.cache for sun times and geocoding | Accepted |
| [0018](0018-day-sky-view.md) | Day sky view | Accepted |

ADRs are numbered in the order they were written; 0001 to 0008, 0017 and 0018 come from the plan tasks that applied them.
