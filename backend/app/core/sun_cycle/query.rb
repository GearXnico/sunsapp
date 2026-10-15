# Validates the params of GET /api/sun_cycle and exposes the normalized location and date range.
# Called by Api::SunCycleController before any external call; `error` holds the 400 message.
module SunCycle
  class Query
    MAX_DAYS = 366
    MAX_YEARS_AHEAD = 10
    MAX_LOCATION_LENGTH = 200
    DATE_FORMAT = /\A\d{4}-\d{2}-\d{2}\z/

    attr_reader :location, :dates, :error

    def initialize(params)
      @error = validate(params[:location], params[:start_date], params[:end_date])
    end

    def valid?
      error.nil?
    end

    private

    def validate(location, start_param, end_param)
      values = [ location, start_param, end_param ]
      return "Missing parameters" unless values.all? { |value| value.is_a?(String) && value.present? }

      @location = location.strip.split.map(&:capitalize).join(" ")
      return "Invalid location" if @location.length > MAX_LOCATION_LENGTH

      start_date = parse_date(start_param)
      end_date = parse_date(end_param)
      return "Invalid date format" unless start_date && end_date
      return "Invalid date range" if start_date > end_date

      limit = Date.current >> (12 * MAX_YEARS_AHEAD)
      late = [ start_date, end_date ].find { |date| date > limit }
      return "#{late} exceeds the allowed future limit (#{MAX_YEARS_AHEAD} years from today)." if late
      return "Date range cannot exceed #{MAX_DAYS} days" if (end_date - start_date).to_i >= MAX_DAYS

      @dates = start_date..end_date
      nil
    end

    def parse_date(value)
      Date.iso8601(value) if DATE_FORMAT.match?(value)
    rescue Date::Error
      nil
    end
  end
end
