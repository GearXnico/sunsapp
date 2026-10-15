# sunsapp backend

Rails 8.1 API (Ruby 4.0.7) with one endpoint, `GET /api/sun_cycle`. It geocodes a place with Nominatim, gets the sun times from SunriseSunset.io and caches both for 30 days in `Rails.cache` (Solid Cache in production, the memory store in development). Contract: [docs/api.md](../docs/api.md).

## Run

```bash
bundle install
bin/rails db:prepare        # prepares the SQLite databases in storage/
bin/rails server            # http://localhost:3000
```

Or run the whole app from the repo root with `docker compose up`. The Ruby version is in `.ruby-version`.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `CORS_ORIGINS` | `http://localhost:3001` | Comma-separated origins allowed to call `/api/*` from a browser. |

Rails does not load `.env.example`; it only lists the variables. No API key is needed.

## Code

```
app/controllers/api/sun_cycle_controller.rb   wires the core and renders JSON or { error }
app/core/sun_cycle/query.rb                   validates location, dates and range (400 messages)
app/core/sun_cycle/geocoding_client.rb        place name -> [lat, lng] (Geocoder + Nominatim), cached
app/core/sun_cycle/lookup.rb                  reads Rails.cache per day, fetches the missing days, writes them
app/core/sun_cycle/sunrise_sunset_client.rb   HTTP client for SunriseSunset.io (24-hour local times)
config/initializers/                          cors.rb, geocoder.rb, filter_parameter_logging.rb
```

Why the logic lives in `app/core/`: [ADR 0001](../docs/adr/0001-monorepo-rails-api-react.md). Range limits: [ADR 0007](../docs/adr/0007-sqlite-cache-and-range-limit.md); cache: ADR 0017 (see the [ADR index](../docs/adr/README.md)).

## Tests and checks

```bash
bin/rails test                              # Minitest; SimpleCov fails below 80 %
bin/rubocop
bin/brakeman --no-pager
bundle exec bundler-audit check --update
```

`test/` mirrors `app/`. WebMock blocks every real HTTP call and Geocoder uses in-memory stubs; SunriseSunset.io answers come from `test/fixtures/files/sunrise_sunset/`.

`Dockerfile` builds the production image; it is not used by `compose.yml`.
