require "test_helper"

class Api::SunCycleControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get api_sun_cycle_index_url
    assert_response :success
  end
end
