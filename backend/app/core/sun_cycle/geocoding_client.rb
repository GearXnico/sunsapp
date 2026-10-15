# Turns a location name into [lat, lng] with Geocoder (Nominatim, see config/initializers/geocoder.rb).
# Called by Api::SunCycleController. Matches are cached for 30 days (Nominatim usage policy), keyed by
# a SHA-256 of the normalized name so the location text is not stored. Returns nil when nothing
# matches (not cached); lookup errors are raised (Geocoder `always_raise: :all`), also not cached,
# so the controller answers a generic 500 instead of a wrong 400.
module SunCycle
  module GeocodingClient
    EXPIRES_IN = 30.days

    def self.coordinates(location)
      key = "geocoding/v1/#{Digest::SHA256.hexdigest(location.downcase.squish)}"
      Rails.cache.fetch(key, expires_in: EXPIRES_IN, skip_nil: true) { search(location) }
    end

    def self.search(location)
      coordinates = Geocoder.search(location).first&.coordinates
      return nil unless coordinates.is_a?(Array) && coordinates.size == 2 && coordinates.all?(Numeric)

      coordinates
    end
    private_class_method :search
  end
end
