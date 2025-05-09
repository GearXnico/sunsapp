class Api::SunCycleController < ApplicationController
  def index
    location = params[:location]
    start_date = params[:start_date]
    end_date = params[:end_date]

    # validate invalid/missing parameters
    if location.nil? || start_date.nil? || end_date.nil?
      return render json: { error: "Invalid or missing parameters" }, status: :bad_request
    end

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
        end
      end
    end

    render json: results.as_json(only: [:location, :start_date, :end_date, :sunrise, :sunset, :golden_hour])
  rescue => e
    Rails.logger.error("Fetcher error: #{e.message}")
    render json: { error: "Server error: #{e.message}" }, status: :internal_server_error
  end
end
