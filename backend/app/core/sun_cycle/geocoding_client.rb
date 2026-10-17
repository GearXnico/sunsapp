# Turns a location name into { lat:, lng:, name: } with Geocoder (Nominatim, see config/initializers/geocoder.rb).
# Called by Api::SunCycleController. Matches are cached for 30 days (Nominatim usage policy), keyed by
# a SHA-256 of the normalized name so the location text is not stored. Returns nil when nothing
# matches (not cached); lookup errors are raised (Geocoder `always_raise: :all`), also not cached,
# so the controller answers a generic 500 instead of a wrong 400.
module SunCycle
  module GeocodingClient
    EXPIRES_IN = 30.days

    # `name` is the place the geocoder matched (ADR 0011), or nil if it sent none.
    def self.place(location)
      key = "geocoding/v2/#{Digest::SHA256.hexdigest(location.downcase.squish)}"
      Rails.cache.fetch(key, expires_in: EXPIRES_IN, skip_nil: true) { search(location) }
    end

    def self.search(location)
      result = Geocoder.search(location).first
      coordinates = result&.coordinates
      return nil unless coordinates.is_a?(Array) && coordinates.size == 2 && coordinates.all?(Numeric)

      name = result.address
      { lat: coordinates[0], lng: coordinates[1], name: name.is_a?(String) ? name.squish.presence : nil }
    end
    private_class_method :search
  end
end
