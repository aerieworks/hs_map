require 'test_helper'

class TimeLabelsControllerTest < ActionController::TestCase
  setup do
    @time_label = time_labels(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:time_labels)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create time_label" do
    assert_difference('TimeLabel.count') do
      post :create, time_label: {  }
    end

    assert_redirected_to time_label_path(assigns(:time_label))
  end

  test "should show time_label" do
    get :show, id: @time_label
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @time_label
    assert_response :success
  end

  test "should update time_label" do
    patch :update, id: @time_label, time_label: {  }
    assert_redirected_to time_label_path(assigns(:time_label))
  end

  test "should destroy time_label" do
    assert_difference('TimeLabel.count', -1) do
      delete :destroy, id: @time_label
    end

    assert_redirected_to time_labels_path
  end
end
