require "test_helper"
require "minitest/mock"

class SunCycle::GeocodingClientTest < ActiveSupport::TestCase
  use_memory_cache

  test "returns the coordinates of the first match" do
    Geocoder::Lookup::Test.add_stub("Tokyo", [ { "coordinates" => [ 35.6762, 139.6503 ] } ])

    assert_equal [ 35.6762, 139.6503 ], SunCycle::GeocodingClient.coordinates("Tokyo")
  end

  test "returns nil when nothing matches" do
    assert_nil SunCycle::GeocodingClient.coordinates("Nowhere")
  end

  test "returns nil when the match has no usable coordinates" do
    Geocoder::Lookup::Test.add_stub("Broken", [ { "coordinates" => [] } ])

    assert_nil SunCycle::GeocodingClient.coordinates("Broken")
  end

  test "lets lookup errors through so the controller answers 500" do
    Geocoder.stub(:search, ->(*) { raise Geocoder::ServiceUnavailable }) do
      assert_raises(Geocoder::ServiceUnavailable) { SunCycle::GeocodingClient.coordinates("Tokyo") }
    end
  end

  test "geocodes the same place once for names that differ only in case and spaces" do
    calls = 0
    search = ->(*) { calls += 1; [ Geocoder::Result::Test.new("coordinates" => [ 35.6762, 139.6503 ]) ] }

    Geocoder.stub(:search, search) do
      assert_equal [ 35.6762, 139.6503 ], SunCycle::GeocodingClient.coordinates("Tokyo")
      assert_equal [ 35.6762, 139.6503 ], SunCycle::GeocodingClient.coordinates("  tokyo ")
      assert_equal [ 35.6762, 139.6503 ], SunCycle::GeocodingClient.coordinates("TOKYO")
    end

    assert_equal 1, calls
  end

  test "does not cache misses or lookup errors" do
    calls = 0
    Geocoder.stub(:search, ->(*) { calls += 1; [] }) do
      2.times { assert_nil SunCycle::GeocodingClient.coordinates("Nowhere") }
    end
    Geocoder.stub(:search, ->(*) { calls += 1; raise Geocoder::ServiceUnavailable }) do
      2.times { assert_raises(Geocoder::ServiceUnavailable) { SunCycle::GeocodingClient.coordinates("Tokyo") } }
    end

    assert_equal 4, calls
  end

  test "keys the cache by a hash of the normalized name, not the name itself" do
    Geocoder::Lookup::Test.add_stub("Secret  Street 123", [ { "coordinates" => [ 1.0, 2.0 ] } ])
    SunCycle::GeocodingClient.coordinates("Secret  Street 123")

    assert Rails.cache.exist?("geocoding/v1/#{Digest::SHA256.hexdigest("secret street 123")}")
  end

  test "identifies the app to Nominatim and sets a timeout" do
    config = Geocoder.config

    assert_equal "sunsapp (+https://github.com/GearXnico/sunsapp)", config.http_headers["User-Agent"]
    assert_equal 5, config.timeout
    assert_equal :all, config.always_raise
  end
end
