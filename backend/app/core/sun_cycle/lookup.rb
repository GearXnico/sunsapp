# Returns the sun times of a place for a date range: reads the SQLite cache by coordinates
# rounded to 4 decimals (~11 m) and date, fetches the missing days in one call and saves them.
# Called by Api::SunCycleController. Returns { timezone:, days: [...] } or nil when there is no data.
module SunCycle
  class Lookup
    PRECISION = 4

    def initialize(lat, lng, dates)
      @lat = lat.round(PRECISION)
      @lng = lng.round(PRECISION)
      @dates = dates
    end

    def call
      cached = SunCycleData.where(lat: @lat, long: @lng, start_date: @dates).index_by(&:start_date)
      missing = @dates.reject { |date| cached.key?(date) }
      fetch_and_save(missing.first..missing.last, cached) if missing.any?

      records = @dates.filter_map { |date| cached[date] }
      return nil if records.empty?

      { timezone: records.first.timezone, days: records.map { |record| serialize(record) } }
    end

    private

    def fetch_and_save(range, cached)
      fetched = SunriseSunsetClient.new(@lat, @lng, range).call
      return unless fetched

      fetched[:days].each do |day|
        next if cached.key?(day[:date]) || !range.cover?(day[:date])

        cached[day[:date]] = SunCycleData.create!(
          lat: @lat, long: @lng, start_date: day[:date], end_date: day[:date],
          sunrise: day[:sunrise], sunset: day[:sunset], golden_hour: day[:golden_hour],
          timezone: fetched[:timezone], utc_offset: day[:utc_offset]
        )
      end
    end

    def serialize(record)
      { date: record.start_date.iso8601, sunrise: record.sunrise, sunset: record.sunset,
        golden_hour: record.golden_hour, utc_offset: record.utc_offset }
    end
  end
end
