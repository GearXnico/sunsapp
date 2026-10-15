require "test_helper"

class SunCycleFetcherTest < ActiveSupport::TestCase
  DATE = Date.new(2026, 6, 21)

  def fetch
    SunCycleFetcher.new(-33.4489, -70.6693, DATE, DATE).call
  end

  test "returns sunrise, sunset and golden hour from the API" do
    stub = stub_sunrise_sunset(DATE)

    assert_equal({ sunrise: "7:46:34 AM", sunset: "5:42:11 PM", golden_hour: "5:05:40 PM" }, fetch)
    assert_requested stub, times: 1
  end

  test "sends coordinates and dates as query parameters" do
    stub = stub_request(:get, "https://api.sunrisesunset.io/json")
      .with(query: { lat: "-33.4489", lng: "-70.6693", date_start: "2026-06-21", date_end: "2026-06-21", formatted: "0" })
      .to_return(status: 200, body: sunrise_sunset_body(DATE), headers: { "Content-Type" => "application/json" })

    fetch
    assert_requested stub
  end

  test "returns nil when the API answers with a non-2xx status" do
    stub_sunrise_sunset(DATE, status: 503, body: { status: "ERROR" }.to_json)

    assert_nil fetch
  end

  test "returns nil when the API returns no results" do
    stub_sunrise_sunset(DATE, body: { results: [], status: "OK" }.to_json)

    assert_nil fetch
  end

  test "returns nil when sunrise is missing" do
    stub_sunrise_sunset(DATE, body: sunrise_sunset_body(DATE, sunrise: nil))

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
end
