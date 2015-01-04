require 'test_helper'

class MapControllerTest < ActionController::TestCase
  test "should get map" do
    get :map
    assert_response :success
  end

end
