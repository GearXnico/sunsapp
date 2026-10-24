# 0009. Free deployment

## Status

Accepted (2026-10-17)

## Context

sunsapp is not deployed. The goal is to publish it at $0: a Rails API (one process, `backend/Dockerfile`) and a static frontend (`npm run build` → `frontend/dist/`). The API caches with `Rails.cache`, which in production is Solid Cache on a SQLite file in `storage/`.

Many free tiers have no persistent disk: the file system is reset on every deploy or restart, and some services sleep when idle. With no disk the app still works, but the cache starts empty after each restart, so more calls go to SunriseSunset.io and Nominatim (ADR 0010, ADR 0012).

Prices and limits of free tiers change often. They must be checked in each provider's official documentation on the day this ADR is decided; nothing below is a statement of current prices or limits.

## Options considered

Backend (container or Ruby app on a free tier):

1. **Render (free web service):** deploys from the repo or the Dockerfile; free services are known to sleep when idle and not to include a persistent disk. Verify both.
2. **Fly.io:** runs the Docker image close to the user and offers volumes for SQLite; whether any of it is free, and under which conditions, must be verified.
3. **Koyeb:** deploys Docker images with a free instance; verify the sleep policy and whether storage persists.

Frontend (static hosting, usually free for public sites):

1. **GitHub Pages:** same place as the repo, deploy from a GitHub Actions workflow; no server-side config.
2. **Cloudflare Pages or Netlify:** free static hosting with preview deploys per PR; another account to manage.

## Checked on 2026-10-17 (official docs)

- **Render** ([render.com/docs/free](https://render.com/docs/free)): free web services exist; they spin down after 15 minutes without traffic, take about a minute to wake up, cannot attach a persistent disk, and share 750 free instance hours per month.
- **Fly.io** ([docs.fly.io/about/pricing](https://docs.fly.io/about/pricing)): new organizations have no free tier, only a short trial, and volumes are billed.
- **Koyeb** ([koyeb.com/pricing](https://www.koyeb.com/pricing)): the pricing page lists no free web service.

None keeps a persistent disk at $0.

## Decision

Render, chosen on 2026-10-17. The API runs on Render's free plan from `render.yaml` (Docker, deploys `main`), and its cache is lost on restart. The frontend is on GitHub Pages, built by `.github/workflows/pages.yml` on push to `main` with `VITE_API_URL` from the `API_URL` repository variable. `CORS_ORIGINS` is the Pages origin, `https://gearxnico.github.io`.

## Consequences

- Publishing needs a deploy workflow and a repository variable in GitHub, and any change to them needs the maintainer's approval (`AGENTS.md`, "Ask before").
- Without a persistent disk the cache is empty after each restart; the rate limit (ADR 0012) matters more.
- A backend that sleeps makes the first search slow; the frontend should keep its loading screen.
- If a free tier changes or ends, the Dockerfile and the static `dist/` keep the move to another host small.
