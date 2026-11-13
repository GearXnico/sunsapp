# Turns a location name into { lat:, lng:, name: } with Geocoder (Nominatim, see config/initializers/geocoder.rb).
# Called by Api::SunCycleController. Matches are cached for 30 days (Nominatim usage policy), keyed by
# a SHA-256 of the normalized name so the location text is not stored. Returns nil when nothing
# matches (not cached); lookup errors are raised (Geocoder `always_raise: :all`), also not cached,
# so the controller answers a generic 500 instead of a wrong 400.
module SunCycle
  module GeocodingClient
    EXPIRES_IN = 30.days

    # Nominatim allows at most one request per second for the whole app. The API runs as a single
    # Puma process, so a lock shared by its threads is enough to space the requests.
    mattr_accessor :min_interval, default: 1.0
    @pace = Mutex.new
    @last_request_at = nil

    # `name` is the place the geocoder matched (ADR 0011), or nil if it sent none.
    def self.place(location)
      key = "geocoding/v2/#{Digest::SHA256.hexdigest(location.downcase.squish)}"
      Rails.cache.fetch(key, expires_in: EXPIRES_IN, skip_nil: true) { search(location) }
    end

    def self.search(location)
      wait_for_turn
      result = Geocoder.search(location).first
      coordinates = result&.coordinates
      return nil unless coordinates.is_a?(Array) && coordinates.size == 2 && coordinates.all?(Numeric)

      name = result.address
      { lat: coordinates[0], lng: coordinates[1], name: name.is_a?(String) ? name.squish.presence : nil }
    end

    def self.wait_for_turn
      @pace.synchronize do
        if @last_request_at
          remaining = min_interval - (now - @last_request_at)
          pause(remaining) if remaining.positive?
        end
        @last_request_at = now
      end
    end

    def self.now = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    def self.pause(seconds) = sleep(seconds)

    private_class_method :search, :wait_for_turn
  end
end
