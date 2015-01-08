class TimelinePointsController < ApplicationController
  before_action :set_breadcrumbs
  before_action :set_timeline_point, only: [:show, :edit, :update]

  def index
    @timelines = TimelinePoint.to_ordered_timelines(
      TimelinePoint.includes(thing_instance: [ :thing, :space_time ]).all
    )
  end

  def show
  end

  def new
    @timeline_point = TimelinePoint.new
    render_form :new
  end

  def edit
    render_form :edit
  end

  def create
    @timeline_point = TimelinePoint.new(timeline_point_params)
    to_save = set_timeline_point_when @timeline_point
    is_success = false
    TimelinePoint.transaction do
      if @timeline_point.save
        successes = to_save.each_with_object([]) { |x, a| a.push x if x.save }
        is_success = (successes.length == to_save.length)
      end
    end

    if is_success
      redirect_to @timeline_point
    else
      render_form :new
    end
  end

  def update
    to_save = set_timeline_point_when @timeline_point
    is_success = false
    TimelinePoint.transaction do
      if @timeline_point.update(timeline_point_params)
        successes = to_save.each_with_object([]) { |x, a| a.push x if x.save }
        is_success = (successes.length == to_save.length)
      end
    end

    if is_success
      redirect_to @timeline_point
    else
      render_form :edit
    end
  end

  private
    def set_breadcrumbs
      @breadcrumbs = [ { text: 'Timeline Points', path: timeline_points_path } ]
    end

    def set_timeline_point
      @timeline_point = TimelinePoint.includes(thing_instance: [ :thing, :space_time ]).find(params[:id])
    end

    def set_timeline_point_when tp
      to_save = []
      unless params[:when_id].blank?
        when_point = TimelinePoint.find(params[:when_id])
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

    def timeline_point_params
      params.require(:timeline_point).permit(:thing_instance_id, :where_and_when_id, :description)
    end

    def render_form(form)
      @things = Thing.includes(instances: [ :space_time ]).all
      if params[:where_id].nil?
        @where_id = @timeline_point.when_and_where.nil? ? nil : @timeline_point.when_and_where.thing_instance_id
      else
        @where_id = params[:where_id]
      end

      @initial_when_and_wheres = TimelinePoint.includes(thing_instance: [ :thing, :space_time ]).where(thing_instance_id: @where_id)

      @when_direction = params[:when_direction]
      @when_id = params[:when_id]
      if @timeline_point.new_record?
        @timeline_points = []
      else
        @timeline_points = TimelinePoint.to_ordered_timeline(
          TimelinePoint.where.not(id: @timeline_point.id).where(thing_instance_id: @timeline_point.thing_instance_id)
        )
      end
      render form
    end
end
