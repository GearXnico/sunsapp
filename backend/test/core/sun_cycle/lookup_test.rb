require "test_helper"

class SunCycle::LookupTest < ActiveSupport::TestCase
  DST_START = Date.new(2026, 9, 5)
  DST_END = Date.new(2026, 9, 7)

  def lookup(lat = -33.44891234, lng = -70.66934321, dates = DST_START..DST_END)
    SunCycle::Lookup.new(lat, lng, dates).call
  end

  test "fetches with coordinates rounded to 4 decimals and caches each day" do
    stub = stub_request(:get, "https://api.sunrisesunset.io/json")
      .with(query: hash_including("lat" => "-33.4489", "lng" => "-70.6693"))
      .to_return(status: 200, body: sunrise_sunset_fixture("santiago_dst_start"),
                 headers: { "Content-Type" => "application/json" })

    assert_difference -> { SunCycleData.count }, 3 do
      assert_equal "America/Santiago", lookup[:timezone]
    end

    assert_requested stub, times: 1
    assert_equal [ [ -33.4489, -70.6693 ] ], SunCycleData.distinct.pluck(:lat, :long)
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

  test "returns nil when the API has no data" do
    stub_sunrise_sunset(DST_START, DST_END, status: 503, body: { status: "ERROR" }.to_json)

    assert_nil lookup
    assert_equal 0, SunCycleData.count
  end
end
