class Api::SunCycleController < ApplicationController
  def index
    location = params[:location].presence
    start_date = params[:start_date]
    end_date = params[:end_date]

    return render json: { error: "Missing parameters" }, status: :bad_request unless location && start_date && end_date

    # # validate invalid/missing parameters
    # if location.nil? || start_date.nil? || end_date.nil?
    #   return render json: { error: "Invalid or missing parameters" }, status: :bad_request
    # end

    if start_date.to_date > end_date.to_date
      return render json: { error: "Invalid date range" }, status: :bad_request
    end

    begin
      start_date = Date.parse(start_date)
      end_date = Date.parse(end_date)
    rescue ArgumentError
      return render json: { error: "Invalid date format" }, status: :bad_request
    end

    # formatting location name
    location = location.strip.split.map(&:capitalize)*' '

    # get coordinates from location name
    coordinates = Geocoder.search(location).first&.coordinates
    return render json: { error: "Invalid location" }, status: :bad_request unless coordinates

    lat, lng = coordinates
    results = []

    # fetch sun cycle data for each day in the given range
    start_date.to_date.upto(end_date.to_date) do |date|
      Rails.logger.debug "Fetching data for #{date}"
      existing = SunCycleData.find_by(location: location, start_date: date, end_date: date)
      if existing
        Rails.logger.info "Found existing data for #{date}"
        results << existing
      else
        fetched = SunCycleFetcher.new(lat, lng, date, date).call
        if fetched
          Rails.logger.info "Saving data for #{date}"
          record = SunCycleData.create(
            location: location,
            start_date: date,
            end_date: date,
            lat: lat,
            long: lng,
            sunrise: fetched[:sunrise],
            sunset: fetched[:sunset],
            golden_hour: fetched[:golden_hour]
          )
          results << record
        else
          Rails.logger.warn("Sun data missing for #{date}")
        end
      end
    end

    if results.empty?
      Rails.logger.warn "No sun data found for given parameters"
      render json: { error: "No sunrise or sunset data found for the given range date (#{start_date} to #{end_date}) and location (#{location})" }, status: :not_found
    else
      render json: results.as_json(only: [:location, :start_date, :end_date, :sunrise, :sunset, :golden_hour])
    end
  rescue => e
    Rails.logger.error("Fetcher error: #{e.message}")
    render json: { error: "Server error: #{e.message}" }, status: :internal_server_error
  end
end
