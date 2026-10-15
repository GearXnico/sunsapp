require "test_helper"

class Api::SunCycleControllerTest < ActionDispatch::IntegrationTest
  START = Date.new(2026, 9, 5)
  FINISH = Date.new(2026, 9, 7)

  setup do
    Geocoder::Lookup::Test.add_stub("Santiago", [ { "coordinates" => [ -33.4489, -70.6693 ] } ])
  end

  def get_sun_cycle(params)
    get api_sun_cycle_path, params: params
  end

  def json
    response.parsed_body
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

    assert_difference -> { SunCycleData.count }, 3 do
      get_sun_cycle(location: "santiago", start_date: START.to_s, end_date: FINISH.to_s)
    end

    assert_response :success
    assert_equal(
      {
        "location" => "Santiago",
        "timezone" => "America/Santiago",
        "days" => [
          { "date" => "2026-09-05", "sunrise" => "07:21", "sunset" => "18:51", "golden_hour" => "18:17", "utc_offset" => -240 },
          { "date" => "2026-09-06", "sunrise" => "08:20", "sunset" => "19:51", "golden_hour" => "19:18", "utc_offset" => -180 },
          { "date" => "2026-09-07", "sunrise" => "08:18", "sunset" => "19:52", "golden_hour" => "19:19", "utc_offset" => -180 }
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
      [ { "date" => "2026-06-21", "sunrise" => "04:25", "sunset" => "19:00", "golden_hour" => "18:20", "utc_offset" => 540 } ],
      json["days"]
    )
  end

  test "returns null times for a polar day" do
    Geocoder::Lookup::Test.add_stub("Tromso", [ { "coordinates" => [ 69.6492, 18.9553 ] } ])
    stub_sunrise_sunset(Date.new(2026, 6, 21), body: sunrise_sunset_fixture("tromso_polar"))

    get_sun_cycle(location: "Tromso", start_date: "2026-06-21", end_date: "2026-06-21")

    assert_response :success
    assert_equal(
      [ { "date" => "2026-06-21", "sunrise" => nil, "sunset" => nil, "golden_hour" => nil, "utc_offset" => 120 } ],
      json["days"]
    )
  end

  test "serves cached days without calling the API again" do
    stub = stub_sunrise_sunset(START, FINISH, body: sunrise_sunset_fixture("santiago_dst_start"))
    get_sun_cycle(location: "Santiago", start_date: START.to_s, end_date: FINISH.to_s)
    first_body = json

    assert_no_difference -> { SunCycleData.count } do
      get_sun_cycle(location: "Santiago", start_date: START.to_s, end_date: FINISH.to_s)
    end

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
    assert_equal 3, SunCycleData.count
    assert_requested first_day, times: 1
    assert_requested rest, times: 1
  end

  test "returns 404 when the API has no data for any day" do
    stub_sunrise_sunset(START, status: 503, body: { status: "ERROR" }.to_json)

    get_sun_cycle(location: "Santiago", start_date: START.to_s, end_date: START.to_s)

    assert_response :not_found
    assert_equal 0, SunCycleData.count
  end
end
