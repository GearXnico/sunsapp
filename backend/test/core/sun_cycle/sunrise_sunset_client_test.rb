require "test_helper"

class SunCycle::SunriseSunsetClientTest < ActiveSupport::TestCase
  SANTIAGO = [ -33.4489, -70.6693 ].freeze
  DST_START = Date.new(2026, 9, 5)
  DST_END = Date.new(2026, 9, 7)
  JUNE_21 = Date.new(2026, 6, 21)

  def fetch(start_date = JUNE_21, end_date = start_date, coordinates: SANTIAGO)
    SunCycle::SunriseSunsetClient.new(*coordinates, start_date..end_date).call
  end

  test "asks for 24-hour times for the whole range in one call" do
    stub = stub_request(:get, "https://api.sunrisesunset.io/json")
      .with(query: { lat: "-33.4489", lng: "-70.6693", date_start: "2026-09-05", date_end: "2026-09-07",
                     time_format: "24" })
      .to_return(status: 200, body: sunrise_sunset_fixture("santiago_dst_start"),
                 headers: { "Content-Type" => "application/json" })

    fetch(DST_START, DST_END)
    assert_requested stub, times: 1
  end

  test "returns local 24-hour times and the zone of the place across a DST change" do
    stub_sunrise_sunset(DST_START, DST_END, body: sunrise_sunset_fixture("santiago_dst_start"))

    result = fetch(DST_START, DST_END)

    assert_equal "America/Santiago", result[:timezone]
    assert_equal(
      [
        { date: Date.new(2026, 9, 5), first_light: "05:56", dawn: "06:55", sunrise: "07:21", solar_noon: "13:06",
          golden_hour: "18:17", sunset: "18:51", dusk: "19:17", last_light: "20:16", utc_offset: -240 },
        { date: Date.new(2026, 9, 6), first_light: "06:55", dawn: "07:54", sunrise: "08:20", solar_noon: "14:06",
          golden_hour: "19:18", sunset: "19:51", dusk: "20:17", last_light: "21:16", utc_offset: -180 },
        { date: Date.new(2026, 9, 7), first_light: "06:53", dawn: "07:52", sunrise: "08:18", solar_noon: "14:05",
          golden_hour: "19:19", sunset: "19:52", dusk: "20:18", last_light: "21:17", utc_offset: -180 }
      ],
      result[:days]
    )
  end

  test "returns Tokyo times in Asia/Tokyo" do
    stub_sunrise_sunset(JUNE_21, body: sunrise_sunset_fixture("tokyo"))

    result = fetch(coordinates: [ 35.6762, 139.6503 ])

    assert_equal "Asia/Tokyo", result[:timezone]
    assert_equal(
      [ { date: JUNE_21, first_light: "02:47", dawn: "03:55", sunrise: "04:25", solar_noon: "11:43",
          golden_hour: "18:20", sunset: "19:00", dusk: "19:31", last_light: "20:39", utc_offset: 540 } ],
      result[:days]
    )
  end

  test "keeps polar days with null times" do
    stub_sunrise_sunset(JUNE_21, body: sunrise_sunset_fixture("tromso_polar"))

    result = fetch(coordinates: [ 69.6492, 18.9553 ])

    assert_equal "Europe/Oslo", result[:timezone]
    assert_equal(
      [ { date: JUNE_21, first_light: nil, dawn: nil, sunrise: nil, solar_noon: "12:44", golden_hour: nil,
          sunset: nil, dusk: nil, last_light: nil, utc_offset: 120 } ],
      result[:days]
    )
  end

  test "turns times that are not 24-hour HH:MM into null" do
    stub_sunrise_sunset(JUNE_21, body: sunrise_sunset_body(JUNE_21, sunrise: "7:46:34 AM", sunset: "25:10",
                                                                    golden_hour: "-", solar_noon: "12:60"))

    day = fetch[:days].first

    assert_nil day[:sunrise]
    assert_nil day[:sunset]
    assert_nil day[:golden_hour]
    assert_nil day[:solar_noon]
  end

  test "returns null for twilight times the API does not send" do
    body = JSON.parse(sunrise_sunset_body(JUNE_21))
    body["results"].first.except!("first_light", "dawn", "dusk", "last_light")
    stub_sunrise_sunset(JUNE_21, body: body.to_json)

    day = fetch[:days].first

    assert_equal [ nil, nil, nil, nil ], day.values_at(:first_light, :dawn, :dusk, :last_light)
    assert_equal "07:46", day[:sunrise]
  end

  test "accepts times without seconds" do
    stub_sunrise_sunset(JUNE_21, body: sunrise_sunset_body(JUNE_21, sunrise: "5:41", sunset: "17:05"))

    day = fetch[:days].first

    assert_equal "05:41", day[:sunrise]
    assert_equal "17:05", day[:sunset]
  end

  test "splits ranges longer than 365 days into calls of at most 365 days" do
    first = stub_sunrise_sunset(Date.new(2027, 1, 1), Date.new(2027, 12, 31), body: sunrise_sunset_body(Date.new(2027, 1, 1)))
    second = stub_sunrise_sunset(Date.new(2028, 1, 1), Date.new(2028, 1, 1), body: sunrise_sunset_body(Date.new(2028, 1, 1)))

    result = fetch(Date.new(2027, 1, 1), Date.new(2028, 1, 1))

    assert_equal [ Date.new(2027, 1, 1), Date.new(2028, 1, 1) ], result[:days].map { |day| day[:date] }
    assert_requested first, times: 1
    assert_requested second, times: 1
  end

  test "returns nil when the API answers with a non-2xx status" do
    stub_sunrise_sunset(JUNE_21, status: 503, body: { status: "ERROR" }.to_json)

    assert_nil fetch
  end

  test "returns nil when the API returns no results" do
    stub_sunrise_sunset(JUNE_21, body: { results: [], status: "OK" }.to_json)

    assert_nil fetch
  end

  test "returns nil when the response has no time zone" do
    stub_sunrise_sunset(JUNE_21, body: sunrise_sunset_body(JUNE_21, timezone: nil))

    assert_nil fetch
  end

  test "returns nil when the connection fails" do
    stub_request(:get, %r{\Ahttps://api\.sunrisesunset\.io/json}).to_raise(SocketError)

    assert_nil fetch
  end

  test "returns nil on an HTTParty error" do
    stub_request(:get, %r{\Ahttps://api\.sunrisesunset\.io/json}).to_raise(HTTParty::Error)

    assert_nil fetch
  end

  test "returns nil when the response has no results key" do
    stub_sunrise_sunset(JUNE_21, body: { status: "OK" }.to_json)

    assert_nil fetch
  end

  test "returns nil when the body is not JSON" do
    stub_sunrise_sunset(JUNE_21, body: "<html>oops</html>")

    assert_nil fetch
  end

  test "skips results without a valid date" do
    body = JSON.parse(sunrise_sunset_body(JUNE_21))
    body["results"] << body["results"].first.merge("date" => "not-a-date")
    stub_sunrise_sunset(JUNE_21, body: body.to_json)

    assert_equal [ JUNE_21 ], fetch[:days].map { |day| day[:date] }
  end

  test "returns nil on a timeout" do
    stub_request(:get, %r{\Ahttps://api\.sunrisesunset\.io/json}).to_timeout

    assert_nil fetch
  end

  test "sets a request timeout" do
    assert_equal 10, SunCycle::SunriseSunsetClient.default_options[:timeout]
  end
end
