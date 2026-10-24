---
name: dev-setup
description: Use at the start of a session or when you need the app running locally (backend on :3000, frontend on :3001).
---

# dev-setup

Install dependencies and start the app. Run commands from the repo root unless a step says otherwise.

## Local (no Docker)

1. Check the tool versions: `ruby -v` must match `backend/.ruby-version`, and `node -v` must be the Node LTS the frontend expects (see `frontend/package.json` `engines` once it exists).
2. Backend:
   ```bash
   cd backend
   bundle install
   bin/rails db:prepare
   bin/rails server            # http://localhost:3000
   ```
3. Frontend, in a second terminal:
   ```bash
   cd frontend
   npm ci
   npm run dev                 # Vite on http://localhost:3001
   ```
   The frontend calls the API at `VITE_API_URL` (default `http://localhost:3000`). Set it in `frontend/.env.local` only if the backend runs elsewhere; never commit `.env` files.
4. Smoke test: `curl -s "http://localhost:3000/api/sun_cycle?location=Santiago&start_date=2026-01-01&end_date=2026-01-02"` returns JSON (it needs internet for the external APIs), and http://localhost:3001 loads.

## Docker

1. `docker compose up --build` from the repo root.
2. Open http://localhost:3001; the API is on http://localhost:3000. SQLite lives in a named volume, so `docker compose down` keeps the cache and `docker compose down -v` wipes it.

## If something fails

- Port in use: `lsof -i :3000` / `lsof -i :3001` and stop the old process.
- Do not upgrade Ruby, Node, Rails or a major dependency to make setup work; ask the maintainer first.
