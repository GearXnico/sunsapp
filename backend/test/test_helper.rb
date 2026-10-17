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
      # The rate limiter keeps its counters in the boot-time cache store, so each test starts empty.
      Rails.cache.clear
    end

    teardown do
      Geocoder::Lookup::Test.reset
    end

    # Cache tests call this to get a fresh MemoryStore per test.
    def self.use_memory_cache
      setup do
        @original_cache = Rails.cache
        Rails.cache = ActiveSupport::Cache::MemoryStore.new
      end

      teardown do
        Rails.cache = @original_cache
      end
    end

    # Body of a SunriseSunset.io /json response saved in test/fixtures/files/sunrise_sunset/.
    def sunrise_sunset_fixture(name)
      file_fixture("sunrise_sunset/#{name}.json").read
    end

    # Body of a one-day response with `time_format=24`, for edge cases the fixtures do not cover.
    def sunrise_sunset_body(date, sunrise: "7:46:34", sunset: "17:42:11", golden_hour: "17:05:40",
                            solar_noon: "12:44:22", timezone: "America/Santiago", utc_offset: -240)
      {
        results: [
          { date: date.to_s, first_light: "6:21:10", dawn: "7:18:52", sunrise: sunrise, solar_noon: solar_noon,
            golden_hour: golden_hour, sunset: sunset, dusk: "18:09:53", last_light: "19:07:34",
            day_length: "9:55:37", timezone: timezone, utc_offset: utc_offset }
        ],
        status: "OK"
      }.to_json
    end

    def stub_sunrise_sunset(start_date, end_date = start_date, status: 200, body: sunrise_sunset_body(start_date))
      stub_request(:get, "https://api.sunrisesunset.io/json")
        .with(query: hash_including("date_start" => start_date.to_s, "date_end" => end_date.to_s))
        .to_return(status: status, body: body, headers: { "Content-Type" => "application/json" })
    end
  end
end
