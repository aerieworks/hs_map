class TimePointsController < ApplicationController
  before_action :set_breadcrumbs
  before_action :set_time_point, only: [:show, :edit, :update]

  def index
    @time_points = TimePoint.includes(:space_time).all
  end

  def show
  end

  def new
    @time_point = TimePoint.new
    render_form :new
  end

  def edit
    render_form :edit
  end

  def create
    @time_point = TimePoint.new(time_point_params)
    to_save = set_time_point_when @time_point
    is_success = false
    TimePoint.transaction do
      if @time_point.save
        successes = to_save.each_with_object([]) { |x, a| a.push x if x.save }
        is_success = (successes.length == to_save.length)
      end
    end

    if is_success
      redirect_to @time_point
    else
      render_form :new
    end
  end

  def update
    to_save = set_time_point_when @time_point
    is_success = false
    TimePoint.transaction do
      if @time_point.update(time_point_params)
        successes = to_save.each_with_object([]) { |x, a| a.push x if x.save }
        is_success = (successes.length == to_save.length)
      end
    end

    if is_success
      redirect_to @time_point
    else
      render_form :edit
    end
  end

  private
    def set_breadcrumbs
      @breadcrumbs = [ { text: 'Time Points', path: time_points_path } ]
    end

    def set_time_point
      @time_point = TimePoint.includes(:space_time).find(params[:id])
    end

    def set_time_point_when tp
      to_save = []
      if not params[:when].blank?
        when_point = TimePoint.find(params[:when])
        when_dir = params[:when_direction].to_sym

        new_prev = nil
        new_next = nil
        if when_dir == :before
          new_prev = when_point.previous
          new_next = when_point
        elsif when_dir == :after
          new_prev = when_point
          new_next = when_point.next
        end

        if not new_prev.eql? tp.previous or not new_next.eql? tp.next
          # Connect current location around time point.
          (to_save.push tp.previous and tp.previous.next = tp.next) unless tp.previous.nil?
          (to_save.push tp.next and tp.next.previous = tp.previous) unless tp.next.nil?
          # Connect time point to new location.
          tp.previous = new_prev
          tp.next = new_next
          # Connect new location to time point.
          (to_save.push new_prev and new_prev.next = tp) unless new_prev.nil?
          (to_save.push new_next and new_next.previous = tp) unless new_next.nil?
        end
      end

      return to_save
    end

    def time_point_params
      params.require(:time_point).permit(:space_time_id, :description)
    end

    def render_form(form)
      @space_times = SpaceTime.all
      if @time_point.new_record?
        @time_points = TimePoint.all
      else
        @time_points = TimePoint.where.not(id: @time_point.id)
      end
      render form
    end
end
