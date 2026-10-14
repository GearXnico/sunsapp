require "test_helper"

class Api::SunCycleControllerTest < ActionDispatch::IntegrationTest
  START = Date.new(2026, 6, 20)
  FINISH = Date.new(2026, 6, 22)

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

  test "returns one record per day and caches each day" do
    stubs = (START..FINISH).map { |date| stub_sunrise_sunset(date) }

    assert_difference -> { SunCycleData.count }, 3 do
      get_sun_cycle(location: "santiago", start_date: START.to_s, end_date: FINISH.to_s)
    end

    assert_response :success
    assert_equal %w[2026-06-20 2026-06-21 2026-06-22], json.map { |day| day["start_date"] }
    assert_equal(
      { "location" => "Santiago", "start_date" => "2026-06-20", "end_date" => "2026-06-20",
        "sunrise" => "7:46:34 AM", "sunset" => "5:42:11 PM", "golden_hour" => "5:05:40 PM" },
      json.first
    )
    stubs.each { |stub| assert_requested stub, times: 1 }
  end

  test "serves cached days without calling the API again" do
    stubs = (START..FINISH).map { |date| stub_sunrise_sunset(date) }
    get_sun_cycle(location: "Santiago", start_date: START.to_s, end_date: FINISH.to_s)

    assert_no_difference -> { SunCycleData.count } do
      get_sun_cycle(location: "Santiago", start_date: START.to_s, end_date: FINISH.to_s)
    end

    assert_response :success
    assert_equal 3, json.size
    stubs.each { |stub| assert_requested stub, times: 1 }
  end

  test "returns 404 when the API has no data for any day" do
    stub_sunrise_sunset(START, status: 503, body: { status: "ERROR" }.to_json)

    get_sun_cycle(location: "Santiago", start_date: START.to_s, end_date: START.to_s)

    assert_response :not_found
    assert_equal 0, SunCycleData.count
  end
end
