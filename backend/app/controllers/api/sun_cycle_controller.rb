class Api::SunCycleController < ApplicationController
  def index
    query = SunCycle::Query.new(params)
    return render json: { error: query.error }, status: :bad_request unless query.valid?

    coordinates = SunCycle::GeocodingClient.coordinates(query.location)
    return render json: { error: "Invalid location" }, status: :bad_request unless coordinates

    result = SunCycle::Lookup.new(*coordinates, query.dates).call
    return render json: { error: "No sun data found for this location and dates" }, status: :not_found unless result

    render json: { location: query.location, **result }
  rescue StandardError => e
    Rails.logger.error("sun_cycle failed: #{e.class} at #{e.backtrace&.first}")
    render json: { error: "Internal server error" }, status: :internal_server_error
  end
end
