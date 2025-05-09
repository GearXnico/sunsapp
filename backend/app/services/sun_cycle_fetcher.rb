class SunCycleFetcher
  include HTTParty
  base_uri 'https://api.sunrisesunset.io'
  format :json

  def initialize(lat, long, start_date, end_date)
    @lat = lat
    @long = long
    @start_date = start_date
    @end_date = end_date
  end

  def call
    response = self.class.get("/json", query: {
      lat: @lat,
      lng: @long,
      date_start: @start_date,
      date_end: @end_date,
      formatted: 0
    })

    unless response.success?
      Rails.logger.error("API call failed with code: #{response.code}")
      return nil
    end

    result = response.parsed_response["results"]
    
    if result.empty?
      return nil
    elsif result.first["sunrise"].nil? || result.first["sunset"].nil?
      return nil
    end

    {
      sunrise: result.first["sunrise"],
      sunset: result.first["sunset"],
      golden_hour: result.first["golden_hour"]
    }
  rescue HTTParty::Error, SocketError => e
    Rails.logger.error("HTTP error: #{e.message}")
    nil
  end
end