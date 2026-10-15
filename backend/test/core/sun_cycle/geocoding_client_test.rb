require "test_helper"
require "minitest/mock"

class SunCycle::GeocodingClientTest < ActiveSupport::TestCase
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

  test "identifies the app to Nominatim and sets a timeout" do
    config = Geocoder.config

    assert_equal "sunsapp (+https://github.com/GearXnico/sunsapp)", config.http_headers["User-Agent"]
    assert_equal 5, config.timeout
    assert_equal :all, config.always_raise
  end
end
