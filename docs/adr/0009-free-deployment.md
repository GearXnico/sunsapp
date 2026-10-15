# 0009. Free deployment

## Status

Proposed (2026-10-15)

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

## Decision (proposed)

Pick the backend host that keeps the SQLite file on a persistent disk at $0, if one does after checking the official docs; otherwise accept a cache that is lost on restart. Host the frontend on GitHub Pages, built by CI with `VITE_API_URL` pointing to the backend, and set `CORS_ORIGINS` to the Pages origin.

## Consequences

- Publishing needs a new deploy workflow and secrets in GitHub, which is a change Nico must approve (CLAUDE.md, "Ask first").
- Without a persistent disk the cache is empty after each restart; the rate limit (ADR 0012) matters more.
- A backend that sleeps makes the first search slow; the frontend should keep its loading screen.
- If a free tier changes or ends, the Dockerfile and the static `dist/` keep the move to another host small.
