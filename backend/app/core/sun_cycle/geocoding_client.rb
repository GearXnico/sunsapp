# Turns a location name into [lat, lng] with Geocoder (Nominatim, see config/initializers/geocoder.rb).
# Called by Api::SunCycleController. Returns nil when nothing matches; lookup errors are raised
# (Geocoder `always_raise: :all`) so the controller answers a generic 500 instead of a wrong 400.
module SunCycle
  module GeocodingClient
    def self.coordinates(location)
      coordinates = Geocoder.search(location).first&.coordinates
      return nil unless coordinates.is_a?(Array) && coordinates.size == 2 && coordinates.all?(Numeric)

      coordinates
    end
  end
end
