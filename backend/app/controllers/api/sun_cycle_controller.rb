class Api::SunCycleController < ApplicationController
  def index
    query = SunCycle::Query.new(params)
    return render json: { error: query.error }, status: :bad_request unless query.valid?

    place = SunCycle::GeocodingClient.place(query.location)
    return render json: { error: "Invalid location" }, status: :bad_request unless place

    result = SunCycle::Lookup.new(place[:lat], place[:lng], query.dates).call
    return render json: { error: "No sun data found for this location and dates" }, status: :not_found unless result

    render json: { location: query.location, matched_place: place[:name], **result }
  rescue StandardError => e
    Rails.logger.error("sun_cycle failed: #{e.class} at #{e.backtrace&.first}")
    render json: { error: "Internal server error" }, status: :internal_server_error
  end
end
