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

    return nil unless response.success?
    debugger

    result = response.parsed_response["results"]
    {
      sunrise: result.first["sunrise"],
      sunset: result.first["sunset"],
      golden_hour: result.first["golden_hour"]
    }
  end
end