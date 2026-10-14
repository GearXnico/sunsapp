require "test_helper"

class SunCycleDataTest < ActiveSupport::TestCase
  test "stores one cached day for a location" do
    SunCycleData.create!(
      location: "Santiago", start_date: Date.new(2026, 6, 21), end_date: Date.new(2026, 6, 21),
      lat: -33.4489, long: -70.6693, sunrise: "7:46:34 AM", sunset: "5:42:11 PM", golden_hour: "5:05:40 PM"
    )

    record = SunCycleData.find_by(location: "Santiago", start_date: Date.new(2026, 6, 21))
    assert_equal "7:46:34 AM", record.sunrise
    assert_equal "sun_cycle_data", SunCycleData.table_name
  end
end
