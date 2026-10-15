# HTTP client for SunriseSunset.io: one call per range of up to 365 days, 24-hour local times.
# Called by SunCycle::Lookup for the days missing from the cache. Returns
# { timezone:, days: [{ date:, sunrise:, sunset:, golden_hour:, utc_offset: }] } or nil on any failure.
module SunCycle
  class SunriseSunsetClient
    include HTTParty
    base_uri "https://api.sunrisesunset.io"
    format :json
    default_timeout 10

    # SunriseSunset.io accepts ranges of up to 365 days per call.
    MAX_DAYS_PER_CALL = 365
    # time_format=24 returns "H:MM:SS" or "HH:MM:SS"; seconds are optional to be safe.
    TIME = /\A(\d{1,2}):(\d{2})(?::\d{2})?\z/
    NETWORK_ERRORS = [ HTTParty::Error, SocketError, Timeout::Error, SystemCallError, OpenSSL::SSL::SSLError,
                       JSON::ParserError ].freeze

    def initialize(lat, lng, dates)
      @lat = lat
      @lng = lng
      @dates = dates
    end

    def call
      results = @dates.each_slice(MAX_DAYS_PER_CALL).flat_map do |chunk|
        fetched = fetch(chunk.first, chunk.last)
        return nil unless fetched

        fetched
      end
      timezone = results.first["timezone"]
      return nil unless timezone.is_a?(String) && timezone.present?

      { timezone: timezone, days: results.filter_map { |result| parse_day(result) } }
    rescue *NETWORK_ERRORS => e
      Rails.logger.error("SunriseSunset.io request failed: #{e.class}")
      nil
    end

    private

    def fetch(start_date, end_date)
      response = self.class.get("/json", query: {
        lat: @lat, lng: @lng, date_start: start_date, date_end: end_date, time_format: 24
      })
      unless response.success?
        Rails.logger.error("SunriseSunset.io answered #{response.code}")
        return nil
      end

      body = response.parsed_response
      results = body["results"] if body.is_a?(Hash)
      results = results&.select { |result| result.is_a?(Hash) }
      results.presence
    end

    def parse_day(result)
      date = Date.iso8601(result["date"].to_s)
      {
        date: date,
        sunrise: normalize_time(result["sunrise"]),
        sunset: normalize_time(result["sunset"]),
        golden_hour: normalize_time(result["golden_hour"]),
        utc_offset: result["utc_offset"].is_a?(Integer) ? result["utc_offset"] : nil
      }
    rescue Date::Error
      nil
    end

    def normalize_time(value)
      match = TIME.match(value.to_s)
      return nil unless match

      hours = match[1].to_i
      minutes = match[2].to_i
      return nil if hours > 23 || minutes > 59

      format("%02d:%02d", hours, minutes)
    end
  end
end
