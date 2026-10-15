require "simplecov"
SimpleCov.start "rails" do
  enable_coverage :branch
  minimum_coverage 80
end

ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "webmock/minitest"

# Tests never reach the network.
WebMock.disable_net_connect!

# Geocoder answers from in-memory stubs; unknown locations return no results.
Geocoder.configure(lookup: :test, ip_lookup: :test)

module ActiveSupport
  class TestCase
    # Runs in a single process so SimpleCov sees every test; the suite is small.

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    setup do
      Geocoder::Lookup::Test.set_default_stub([])
    end

    teardown do
      Geocoder::Lookup::Test.reset
    end

    # Body of a SunriseSunset.io /json response for one day, as the API returns it.
    def sunrise_sunset_body(date, sunrise: "7:46:34 AM", sunset: "5:42:11 PM", golden_hour: "5:05:40 PM")
      {
        results: [
          {
            date: date.to_s,
            sunrise: sunrise,
            sunset: sunset,
            first_light: "6:17:03 AM",
            last_light: "7:11:42 PM",
            dawn: "7:18:46 AM",
            dusk: "6:09:59 PM",
            solar_noon: "12:44:22 PM",
            golden_hour: golden_hour,
            day_length: "9:55:37",
            timezone: "America/Santiago",
            utc_offset: -240
          }
        ],
        status: "OK"
      }.to_json
    end

    def stub_sunrise_sunset(date, status: 200, body: sunrise_sunset_body(date))
      stub_request(:get, "https://api.sunrisesunset.io/json")
        .with(query: hash_including("date_start" => date.to_s, "date_end" => date.to_s))
        .to_return(status: status, body: body, headers: { "Content-Type" => "application/json" })
    end
  end
end
