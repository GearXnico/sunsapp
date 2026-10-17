require "test_helper"
require "minitest/mock"

class SunCycle::GeocodingClientTest < ActiveSupport::TestCase
  use_memory_cache

  TOKYO = { lat: 35.6762, lng: 139.6503, name: "Tokyo, Japan" }.freeze

  test "returns the coordinates and name of the first match" do
    Geocoder::Lookup::Test.add_stub("Tokyo", [ { "coordinates" => [ 35.6762, 139.6503 ], "address" => "Tokyo, Japan" } ])

    assert_equal TOKYO, SunCycle::GeocodingClient.place("Tokyo")
  end

  test "returns a nil name when the match has none" do
    Geocoder::Lookup::Test.add_stub("Unnamed", [ { "coordinates" => [ 1.0, 2.0 ], "address" => " " } ])

    assert_equal({ lat: 1.0, lng: 2.0, name: nil }, SunCycle::GeocodingClient.place("Unnamed"))
  end

  test "returns nil when nothing matches" do
    assert_nil SunCycle::GeocodingClient.place("Nowhere")
  end

  test "returns nil when the match has no usable coordinates" do
    Geocoder::Lookup::Test.add_stub("Broken", [ { "coordinates" => [] } ])

    assert_nil SunCycle::GeocodingClient.place("Broken")
  end

  test "lets lookup errors through so the controller answers 500" do
    Geocoder.stub(:search, ->(*) { raise Geocoder::ServiceUnavailable }) do
      assert_raises(Geocoder::ServiceUnavailable) { SunCycle::GeocodingClient.place("Tokyo") }
    end
  end

  test "geocodes the same place once for names that differ only in case and spaces" do
    calls = 0
    search = ->(*) { calls += 1; [ Geocoder::Result::Test.new("coordinates" => [ 35.6762, 139.6503 ], "address" => "Tokyo, Japan") ] }

    Geocoder.stub(:search, search) do
      assert_equal TOKYO, SunCycle::GeocodingClient.place("Tokyo")
      assert_equal TOKYO, SunCycle::GeocodingClient.place("  tokyo ")
      assert_equal TOKYO, SunCycle::GeocodingClient.place("TOKYO")
    end

    assert_equal 1, calls
  end

  test "does not cache misses or lookup errors" do
    calls = 0
    Geocoder.stub(:search, ->(*) { calls += 1; [] }) do
      2.times { assert_nil SunCycle::GeocodingClient.place("Nowhere") }
    end
    Geocoder.stub(:search, ->(*) { calls += 1; raise Geocoder::ServiceUnavailable }) do
      2.times { assert_raises(Geocoder::ServiceUnavailable) { SunCycle::GeocodingClient.place("Tokyo") } }
    end

    assert_equal 4, calls
  end

  test "keys the cache by a hash of the normalized name, not the name itself" do
    Geocoder::Lookup::Test.add_stub("Secret  Street 123", [ { "coordinates" => [ 1.0, 2.0 ] } ])
    SunCycle::GeocodingClient.place("Secret  Street 123")

    assert Rails.cache.exist?("geocoding/v2/#{Digest::SHA256.hexdigest("secret street 123")}")
  end

  test "identifies the app to Nominatim and sets a timeout" do
    config = Geocoder.config

    assert_equal "sunsapp (+https://github.com/GearXnico/sunsapp)", config.http_headers["User-Agent"]
    assert_equal 5, config.timeout
    assert_equal :all, config.always_raise
  end
end
