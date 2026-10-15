class SunCycleFetcher
  include HTTParty
  base_uri "https://api.sunrisesunset.io"
  format :json

  # SunriseSunset.io accepts ranges of up to 365 days per call.
  MAX_DAYS_PER_CALL = 365
  # time_format=24 returns "H:MM:SS" or "HH:MM:SS"; seconds are optional to be safe.
  TIME = /\A(\d{1,2}):(\d{2})(?::\d{2})?\z/

  def initialize(lat, long, start_date, end_date)
    @lat = lat
    @long = long
    @start_date = start_date
    @end_date = end_date
  end

  # Returns { timezone:, days: [{ date:, sunrise:, sunset:, golden_hour:, utc_offset: }] }
  # with local 24-hour "HH:MM" times (nil when the API has none), or nil on failure.
  def call
    results = (@start_date..@end_date).each_slice(MAX_DAYS_PER_CALL).flat_map do |dates|
      chunk = fetch(dates.first, dates.last)
      return nil unless chunk

      chunk
    end
    timezone = results.first&.dig("timezone")
    return nil if timezone.blank?

    { timezone: timezone, days: results.map { |result| parse_day(result) } }
  rescue HTTParty::Error, SocketError => e
    Rails.logger.error("HTTP error: #{e.message}")
    nil
  end

  private

  def fetch(start_date, end_date)
    response = self.class.get("/json", query: {
      lat: @lat,
      lng: @long,
      date_start: start_date,
      date_end: end_date,
      time_format: 24
    })

    unless response.success?
      Rails.logger.error("API call failed with code: #{response.code}")
      return nil
    end

    response.parsed_response["results"].presence
  end

  def parse_day(result)
    {
      date: Date.iso8601(result["date"]),
      sunrise: normalize_time(result["sunrise"]),
      sunset: normalize_time(result["sunset"]),
      golden_hour: normalize_time(result["golden_hour"]),
      utc_offset: result["utc_offset"].is_a?(Integer) ? result["utc_offset"] : nil
    }
  end

  def normalize_time(value)
    match = TIME.match(value.to_s)
    return nil unless match

    hours, minutes = match[1].to_i, match[2].to_i
    return nil if hours > 23 || minutes > 59

    format("%02d:%02d", hours, minutes)
  end
end
