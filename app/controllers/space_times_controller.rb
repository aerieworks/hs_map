class SpaceTimesController < ApplicationController
  before_action :set_breadcrumbs

  def index
    @space_times = SpaceTime.all
  end

  def show
    @space_time = SpaceTime.find params[:id]
    if @space_time.nil?
      head :not_found
    end
  end

  def new
    @space_time = SpaceTime.new
  end

  def create
    @space_time = SpaceTime.new space_time_params
    if @space_time.valid?
      @space_time.save
      redirect_to @space_time
    else
      render 'new'
    end
  end

  def edit
    @space_time = SpaceTime.find params[:id]
    if @space_time.nil?
      head :not_found
    end
  end

  def update
    @space_time = SpaceTime.find params[:id]
    if @space_time.nil?
      head :not_found
    elsif @space_time.update_attributes space_time_params
      redirect_to @space_time
    else
      render 'edit'
    end
  end

  private
  def set_breadcrumbs
    @breadcrumbs = [ { text: 'SpaceTimes', path: space_times_path } ]
  end

  def space_time_params
    params.require(:space_time).permit(:name)
  end
end
