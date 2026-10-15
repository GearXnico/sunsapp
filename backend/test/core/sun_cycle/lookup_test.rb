require "test_helper"

class SunCycle::LookupTest < ActiveSupport::TestCase
  DST_START = Date.new(2026, 9, 5)
  DST_END = Date.new(2026, 9, 7)

  use_memory_cache

  def lookup(lat = -33.44891234, lng = -70.66934321, dates = DST_START..DST_END)
    SunCycle::Lookup.new(lat, lng, dates).call
  end

  test "fetches with coordinates rounded to 4 decimals and caches each day for 30 days" do
    stub = stub_request(:get, "https://api.sunrisesunset.io/json")
      .with(query: hash_including("lat" => "-33.4489", "lng" => "-70.6693"))
      .to_return(status: 200, body: sunrise_sunset_fixture("santiago_dst_start"),
                 headers: { "Content-Type" => "application/json" })

    assert_equal "America/Santiago", lookup[:timezone]

    assert_requested stub, times: 1
    entry = Rails.cache.read("sun_cycle/v1/-33.4489/-70.6693/2026-09-06")
    assert_equal "America/Santiago", entry[:timezone]
    assert_equal(
      { date: "2026-09-06", sunrise: "08:20", sunset: "19:51", golden_hour: "19:18", utc_offset: -180 },
      entry[:day]
    )

    travel 31.days do
      assert_nil Rails.cache.read("sun_cycle/v1/-33.4489/-70.6693/2026-09-06")
    end
  end

  test "a second identical request does not call the API" do
    stub = stub_sunrise_sunset(DST_START, DST_END, body: sunrise_sunset_fixture("santiago_dst_start"))
    first = lookup

    assert_equal first, lookup
    assert_requested stub, times: 1
  end

  test "serves nearby coordinates from the same cache" do
    stub = stub_sunrise_sunset(DST_START, DST_END, body: sunrise_sunset_fixture("santiago_dst_start"))
    first = lookup

    assert_equal first, lookup(-33.44889, -70.66931)
    assert_requested stub, times: 1
  end

  test "fetches only the missing days, in one call" do
    first_day = stub_sunrise_sunset(DST_START, body: sunrise_sunset_body(DST_START))
    lookup(-33.4489, -70.6693, DST_START..DST_START)
    rest = stub_sunrise_sunset(DST_START + 1, DST_END, body: sunrise_sunset_fixture("santiago_dst_start"))

    days = lookup[:days]

    assert_equal %w[2026-09-05 2026-09-06 2026-09-07], days.map { |day| day[:date] }
    assert_equal "07:46", days.first[:sunrise]
    assert_requested first_day, times: 1
    assert_requested rest, times: 1
  end

  test "makes two calls for a 366-day range" do
    first = stub_sunrise_sunset(Date.new(2027, 1, 1), Date.new(2027, 12, 31), body: sunrise_sunset_body(Date.new(2027, 1, 1)))
    second = stub_sunrise_sunset(Date.new(2028, 1, 1), body: sunrise_sunset_body(Date.new(2028, 1, 1)))

    days = lookup(-33.4489, -70.6693, Date.new(2027, 1, 1)..Date.new(2028, 1, 1))[:days]

    assert_equal %w[2027-01-01 2028-01-01], days.map { |day| day[:date] }
    assert_requested first, times: 1
    assert_requested second, times: 1
  end

  test "ignores days the API returns outside the requested range" do
    stub_sunrise_sunset(DST_START, body: sunrise_sunset_fixture("santiago_dst_start"))

    days = lookup(-33.4489, -70.6693, DST_START..DST_START)[:days]

    assert_equal %w[2026-09-05], days.map { |day| day[:date] }
    assert_nil Rails.cache.read("sun_cycle/v1/-33.4489/-70.6693/2026-09-06")
  end

  test "returns nil and caches nothing when the API has no data" do
    stub = stub_sunrise_sunset(DST_START, DST_END, status: 503, body: { status: "ERROR" }.to_json)

    assert_nil lookup
    assert_nil lookup
    assert_requested stub, times: 2
  end
end
