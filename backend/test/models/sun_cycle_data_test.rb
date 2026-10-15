require "test_helper"

class SunCycleDataTest < ActiveSupport::TestCase
  test "stores one cached day with its time zone" do
    SunCycleData.create!(
      location: "Santiago", start_date: Date.new(2026, 9, 6), end_date: Date.new(2026, 9, 6),
      lat: -33.4489, long: -70.6693, sunrise: "08:20", sunset: "19:51", golden_hour: "19:18",
      timezone: "America/Santiago", utc_offset: -180
    )

    record = SunCycleData.find_by(location: "Santiago", start_date: Date.new(2026, 9, 6))
    assert_equal "08:20", record.sunrise
    assert_equal "America/Santiago", record.timezone
    assert_equal(-180, record.utc_offset)
  end
end
