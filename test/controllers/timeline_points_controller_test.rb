require 'test_helper'

class TimelinePointsControllerTest < ActionController::TestCase
  setup do
    @timeline_point = timeline_points(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:timeline_points)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create timeline_point" do
    assert_difference('TimelinePoint.count') do
      post :create, timeline_point: {  }
    end

    assert_redirected_to timeline_point_path(assigns(:timeline_point))
  end

  test "should show timeline_point" do
    get :show, id: @timeline_point
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @timeline_point
    assert_response :success
  end

  test "should update timeline_point" do
    patch :update, id: @timeline_point, timeline_point: {  }
    assert_redirected_to timeline_point_path(assigns(:timeline_point))
  end

  test "should destroy timeline_point" do
    assert_difference('TimelinePoint.count', -1) do
      delete :destroy, id: @timeline_point
    end

    assert_redirected_to timeline_points_path
  end
end
