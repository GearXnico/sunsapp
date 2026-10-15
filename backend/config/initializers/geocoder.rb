# Nominatim usage policy (https://operations.osmfoundation.org/policies/nominatim/): identify the
# app with its own User-Agent and keep requests short. Errors are raised, not swallowed, so a
# Nominatim outage is a 500 and not an "Invalid location" (see SunCycle::GeocodingClient).
Geocoder.configure(
  lookup: :nominatim,
  timeout: 5,
  always_raise: :all,
  http_headers: { "User-Agent" => "sunsapp (+https://github.com/GearXnico/sunsapp)" }
)
