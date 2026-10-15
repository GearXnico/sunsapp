class Api::SunCycleController < ApplicationController
  def index
    location = params[:location].presence
    start_date = params[:start_date].presence
    end_date = params[:end_date].presence

    return render json: { error: "Missing parameters" }, status: :bad_request unless location && start_date && end_date

    if start_date.to_date > end_date.to_date
      return render json: { error: "Invalid date range" }, status: :bad_request
    end

    begin
      start_date = Date.parse(start_date)
      end_date = Date.parse(end_date)
    rescue ArgumentError
      return render json: { error: "Invalid date format" }, status: :bad_request
    end

    max_allowed_date = Date.today >> (12 * 10)
    if start_date > max_allowed_date
      return render json: { error: "#{start_date} exceeds the allowed future limit (10 years from today)." }, status: :bad_request
    elsif end_date > max_allowed_date
      return render json: { error: "#{end_date} exceeds the allowed future limit (10 years from today)." }, status: :bad_request
    end

    # formatting location name
    location = location.strip.split.map(&:capitalize)*" "

    # get coordinates from location name
    coordinates = Geocoder.search(location).first&.coordinates
    return render json: { error: "Invalid location" }, status: :bad_request unless coordinates

    lat, lng = coordinates
    dates = start_date..end_date
    cached = SunCycleData.where(location: location, start_date: dates).index_by(&:start_date)

    # fetch the missing days in one call and cache them
    missing = dates.reject { |date| cached.key?(date) }
    if missing.any?
      fetched = SunCycleFetcher.new(lat, lng, missing.first, missing.last).call
      Rails.logger.warn("Sun data missing for the requested range") unless fetched
      fetched&.dig(:days)&.each do |day|
        next if cached.key?(day[:date]) || !dates.cover?(day[:date])

        cached[day[:date]] = SunCycleData.create!(
          location: location, start_date: day[:date], end_date: day[:date], lat: lat, long: lng,
          sunrise: day[:sunrise], sunset: day[:sunset], golden_hour: day[:golden_hour],
          timezone: fetched[:timezone], utc_offset: day[:utc_offset]
        )
      end
    end

    records = dates.filter_map { |date| cached[date] }
    if records.empty?
      Rails.logger.warn "No sun data found for given parameters"
      render json: { error: "No sunrise or sunset data found for the given range date (#{start_date} to #{end_date}) and location (#{location})" }, status: :not_found
    else
      render json: {
        location: location,
        timezone: records.first.timezone,
        days: records.map do |record|
          { date: record.start_date.iso8601, sunrise: record.sunrise, sunset: record.sunset,
            golden_hour: record.golden_hour, utc_offset: record.utc_offset }
        end
      }
    end
  rescue => e
    Rails.logger.error("Fetcher error: #{e.message}")
    render json: { error: "Server error: #{e.message}" }, status: :internal_server_error
  end
end
