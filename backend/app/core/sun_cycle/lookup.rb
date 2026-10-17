# Returns the sun times of a place for a date range: reads Rails.cache (one entry per place and day,
# coordinates rounded to 4 decimals, ~11 m), fetches the missing days in one call and caches them.
# Called by Api::SunCycleController. Returns { timezone:, days: [...] } or nil when there is no data.
module SunCycle
  class Lookup
    PRECISION = 4
    EXPIRES_IN = 30.days

    def initialize(lat, lng, dates)
      @lat = lat.round(PRECISION)
      @lng = lng.round(PRECISION)
      @dates = dates
    end

    def call
      keys = @dates.map { |date| key(date) }
      cached = Rails.cache.read_multi(*keys)
      missing = @dates.reject { |date| cached.key?(key(date)) }
      cached.merge!(fetch_and_cache(missing.first..missing.last)) if missing.any?

      entries = cached.values_at(*keys).compact
      return nil if entries.empty?

      { timezone: entries.first[:timezone], days: entries.map { |entry| entry[:day] } }
    end

    private

    # v2 (contract v3) added the twilight and solar noon times; v1 entries lack them and are never read.
    def key(date)
      format("sun_cycle/v2/%.#{PRECISION}f/%.#{PRECISION}f/%s", @lat, @lng, date.iso8601)
    end

    # Failures are not cached, so the next request asks the API again.
    def fetch_and_cache(range)
      fetched = SunriseSunsetClient.new(@lat, @lng, range).call
      return {} unless fetched

      entries = fetched[:days].select { |day| range.cover?(day[:date]) }.to_h do |day|
        [ key(day[:date]), { timezone: fetched[:timezone], day: serialize(day) } ]
      end
      Rails.cache.write_multi(entries, expires_in: EXPIRES_IN)
      entries
    end

    def serialize(day)
      { **day, date: day[:date].iso8601 }
    end
  end
end
