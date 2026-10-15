require "test_helper"

class SunCycle::QueryTest < ActiveSupport::TestCase
  def query(location: "santiago  de chile ", start_date: "2026-09-05", end_date: "2026-09-07")
    SunCycle::Query.new({ location: location, start_date: start_date, end_date: end_date })
  end

  test "normalizes the location and builds the date range" do
    result = query

    assert result.valid?
    assert_equal "Santiago De Chile", result.location
    assert_equal Date.new(2026, 9, 5)..Date.new(2026, 9, 7), result.dates
  end

  test "rejects missing or blank params" do
    assert_equal "Missing parameters", query(end_date: nil).error
    assert_equal "Missing parameters", query(location: "  ").error
  end

  test "rejects params that are not strings" do
    assert_equal "Missing parameters", query(location: [ "Santiago" ]).error
    assert_equal "Missing parameters", query(start_date: { "y" => "2026" }).error
  end

  test "rejects a location longer than 200 characters" do
    assert_equal "Invalid location", query(location: "a" * 201).error
    assert query(location: "a" * 200).valid?
  end

  test "rejects dates that do not exist or are not YYYY-MM-DD" do
    [ "2026-02-30", "05/09/2026", "2026-9-5", "tomorrow", "2026-09-05T00:00" ].each do |value|
      assert_equal "Invalid date format", query(start_date: value).error, value
    end
  end

  test "rejects a start date after the end date" do
    assert_equal "Invalid date range", query(start_date: "2026-09-08").error
  end

  test "accepts 366 days and rejects 367" do
    assert query(start_date: "2027-01-01", end_date: "2028-01-01").valid?
    assert_equal "Date range cannot exceed 366 days", query(start_date: "2027-01-01", end_date: "2028-01-02").error
  end

  test "rejects dates more than 10 years ahead" do
    far = Date.current + 11.years

    assert_includes query(start_date: far.to_s, end_date: far.to_s).error, "exceeds the allowed future limit"
    assert_includes query(start_date: Date.current.to_s, end_date: (Date.current + 11.years).to_s).error,
                    "exceeds the allowed future limit"
  end
end
