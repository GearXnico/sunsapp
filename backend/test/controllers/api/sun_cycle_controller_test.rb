require "test_helper"
require "minitest/mock"

class Api::SunCycleControllerTest < ActionDispatch::IntegrationTest
  START = Date.new(2026, 9, 5)
  FINISH = Date.new(2026, 9, 7)

  use_memory_cache

  setup do
    Geocoder::Lookup::Test.add_stub("Santiago", [ { "coordinates" => [ -33.4489, -70.6693 ], "address" => "Santiago, Región Metropolitana de Santiago, Chile" } ])
  end

  def get_sun_cycle(params)
    get api_sun_cycle_path, params: params
  end

  def json
    response.parsed_body
  end

  test "returns 429 after 20 requests from the same IP within a minute" do
    20.times { get_sun_cycle(location: "Santiago") }
    assert_response :bad_request

    get_sun_cycle(location: "Santiago")

    assert_response :too_many_requests
    assert_equal "Too many requests", json["error"]
  end

  test "returns 400 when a parameter is missing" do
    get_sun_cycle(location: "Santiago", start_date: "2026-06-20")

    assert_response :bad_request
    assert_equal "Missing parameters", json["error"]
  end

  test "returns 400 when start date is after end date" do
    get_sun_cycle(location: "Santiago", start_date: "2026-06-22", end_date: "2026-06-20")

    assert_response :bad_request
    assert_equal "Invalid date range", json["error"]
  end

  test "returns 400 when start date is more than 10 years ahead" do
    far = Date.today + 11.years
    get_sun_cycle(location: "Santiago", start_date: far.to_s, end_date: (far + 1).to_s)

    assert_response :bad_request
    assert_includes json["error"], "exceeds the allowed future limit"
  end

  test "returns 400 when end date is more than 10 years ahead" do
    get_sun_cycle(location: "Santiago", start_date: Date.today.to_s, end_date: (Date.today + 11.years).to_s)

    assert_response :bad_request
    assert_includes json["error"], "exceeds the allowed future limit"
  end

  test "returns 400 when the location is unknown" do
    get_sun_cycle(location: "Nowhere", start_date: "2026-06-20", end_date: "2026-06-20")

    assert_response :bad_request
    assert_equal "Invalid location", json["error"]
  end

  test "returns local 24-hour times with the zone of the place across a DST change" do
    stub = stub_sunrise_sunset(START, FINISH, body: sunrise_sunset_fixture("santiago_dst_start"))

    get_sun_cycle(location: "santiago", start_date: START.to_s, end_date: FINISH.to_s)

    assert_response :success
    assert_equal(
      {
        "location" => "Santiago",
        "matched_place" => "Santiago, Región Metropolitana de Santiago, Chile",
        "timezone" => "America/Santiago",
        "days" => [
          { "date" => "2026-09-05", "first_light" => "05:56", "dawn" => "06:55", "sunrise" => "07:21",
            "solar_noon" => "13:06", "golden_hour" => "18:17", "sunset" => "18:51", "dusk" => "19:17",
            "last_light" => "20:16", "utc_offset" => -240 },
          { "date" => "2026-09-06", "first_light" => "06:55", "dawn" => "07:54", "sunrise" => "08:20",
            "solar_noon" => "14:06", "golden_hour" => "19:18", "sunset" => "19:51", "dusk" => "20:17",
            "last_light" => "21:16", "utc_offset" => -180 },
          { "date" => "2026-09-07", "first_light" => "06:53", "dawn" => "07:52", "sunrise" => "08:18",
            "solar_noon" => "14:05", "golden_hour" => "19:19", "sunset" => "19:52", "dusk" => "20:18",
            "last_light" => "21:17", "utc_offset" => -180 }
        ]
      },
      json
    )
    assert_requested stub, times: 1
  end

  test "returns Tokyo times in Asia/Tokyo" do
    Geocoder::Lookup::Test.add_stub("Tokyo", [ { "coordinates" => [ 35.6762, 139.6503 ] } ])
    stub_sunrise_sunset(Date.new(2026, 6, 21), body: sunrise_sunset_fixture("tokyo"))

    get_sun_cycle(location: "Tokyo", start_date: "2026-06-21", end_date: "2026-06-21")

    assert_response :success
    assert_equal "Asia/Tokyo", json["timezone"]
    assert_equal(
      [ { "date" => "2026-06-21", "first_light" => "02:47", "dawn" => "03:55", "sunrise" => "04:25",
          "solar_noon" => "11:43", "golden_hour" => "18:20", "sunset" => "19:00", "dusk" => "19:31",
          "last_light" => "20:39", "utc_offset" => 540 } ],
      json["days"]
    )
  end

  test "returns null times for a polar day" do
    Geocoder::Lookup::Test.add_stub("Tromso", [ { "coordinates" => [ 69.6492, 18.9553 ] } ])
    stub_sunrise_sunset(Date.new(2026, 6, 21), body: sunrise_sunset_fixture("tromso_polar"))

    get_sun_cycle(location: "Tromso", start_date: "2026-06-21", end_date: "2026-06-21")

    assert_response :success
    assert_equal(
      [ { "date" => "2026-06-21", "first_light" => nil, "dawn" => nil, "sunrise" => nil, "solar_noon" => "12:44",
          "golden_hour" => nil, "sunset" => nil, "dusk" => nil, "last_light" => nil, "utc_offset" => 120 } ],
      json["days"]
    )
  end

  test "serves cached days without calling the API again" do
    stub = stub_sunrise_sunset(START, FINISH, body: sunrise_sunset_fixture("santiago_dst_start"))
    get_sun_cycle(location: "Santiago", start_date: START.to_s, end_date: FINISH.to_s)
    first_body = json

    get_sun_cycle(location: "Santiago", start_date: START.to_s, end_date: FINISH.to_s)

    assert_response :success
    assert_equal first_body, json
    assert_requested stub, times: 1
  end

  test "fetches only the days missing from the cache, in one call" do
    first_day = stub_sunrise_sunset(START, body: sunrise_sunset_body(START, sunrise: "7:21:47"))
    get_sun_cycle(location: "Santiago", start_date: START.to_s, end_date: START.to_s)
    rest = stub_sunrise_sunset(START + 1, FINISH, body: sunrise_sunset_fixture("santiago_dst_start"))

    get_sun_cycle(location: "Santiago", start_date: START.to_s, end_date: FINISH.to_s)

    assert_response :success
    assert_equal %w[2026-09-05 2026-09-06 2026-09-07], json["days"].map { |day| day["date"] }
    assert_requested first_day, times: 1
    assert_requested rest, times: 1
  end

  test "returns 404 when the API has no data for any day" do
    stub_sunrise_sunset(START, status: 503, body: { status: "ERROR" }.to_json)

    get_sun_cycle(location: "Santiago", start_date: START.to_s, end_date: START.to_s)

    assert_response :not_found
  end

  test "returns 400 when a date does not exist" do
    get_sun_cycle(location: "Santiago", start_date: "2026-02-30", end_date: "2026-03-01")

    assert_response :bad_request
    assert_equal "Invalid date format", json["error"]
  end

  test "returns 400 when a date is not YYYY-MM-DD" do
    get_sun_cycle(location: "Santiago", start_date: "05/09/2026", end_date: "2026-09-07")

    assert_response :bad_request
    assert_equal "Invalid date format", json["error"]
  end

  test "returns 400 when the range is longer than 366 days" do
    get_sun_cycle(location: "Santiago", start_date: "2027-01-01", end_date: "2028-01-02")

    assert_response :bad_request
    assert_equal "Date range cannot exceed 366 days", json["error"]
  end

  test "returns 400 when a parameter is not a string" do
    get_sun_cycle(location: [ "Santiago" ], start_date: START.to_s, end_date: FINISH.to_s)

    assert_response :bad_request
    assert_equal "Missing parameters", json["error"]
  end

  test "returns 400 when the location is too long" do
    get_sun_cycle(location: "a" * 201, start_date: START.to_s, end_date: FINISH.to_s)

    assert_response :bad_request
    assert_equal "Invalid location", json["error"]
  end

  test "returns 404 when the API response has no results key" do
    stub_sunrise_sunset(START, body: { status: "OK" }.to_json)

    get_sun_cycle(location: "Santiago", start_date: START.to_s, end_date: START.to_s)

    assert_response :not_found
  end

  test "returns a generic 500 and logs no internal details or location when the geocoder fails" do
    logs = StringIO.new
    logger = ActiveSupport::Logger.new(logs)
    Rails.logger.broadcast_to(logger)

    Geocoder.stub(:search, ->(*) { raise Timeout::Error, "upstream detail" }) do
      get_sun_cycle(location: "Secret Street 123", start_date: START.to_s, end_date: START.to_s)
    end

    assert_response :internal_server_error
    assert_equal({ "error" => "Internal server error" }, json)
    assert_includes logs.string, "Timeout::Error"
    refute_includes logs.string, "Secret Street"
  ensure
    Rails.logger.stop_broadcasting_to(logger)
  end

  test "shares the cache between names of the same place" do
    Geocoder::Lookup::Test.add_stub("Santiago, Chile", [ { "coordinates" => [ -33.44888, -70.66932 ] } ])
    stub = stub_sunrise_sunset(START, FINISH, body: sunrise_sunset_fixture("santiago_dst_start"))

    get_sun_cycle(location: "Santiago", start_date: START.to_s, end_date: FINISH.to_s)
    get_sun_cycle(location: "Santiago, Chile", start_date: START.to_s, end_date: FINISH.to_s)

    assert_response :success
    assert_equal "Santiago, Chile", json["location"]
    assert_requested stub, times: 1
  end

  test "returns a null matched place when the geocoder sends no name" do
    Geocoder::Lookup::Test.add_stub("Tokyo", [ { "coordinates" => [ 35.6762, 139.6503 ] } ])
    stub_sunrise_sunset(Date.new(2026, 6, 21), body: sunrise_sunset_fixture("tokyo"))

    get_sun_cycle(location: "Tokyo", start_date: "2026-06-21", end_date: "2026-06-21")

    assert_response :success
    assert json.key?("matched_place")
    assert_nil json["matched_place"]
  end

  test "allows CORS only from the configured origin" do
    get api_sun_cycle_path, headers: { "Origin" => "http://localhost:3001" }
    assert_equal "http://localhost:3001", response.headers["Access-Control-Allow-Origin"]

    get api_sun_cycle_path, headers: { "Origin" => "https://evil.example" }
    assert_nil response.headers["Access-Control-Allow-Origin"]
  end
end
