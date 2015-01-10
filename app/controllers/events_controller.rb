class EventsController < ApplicationController
  before_action :set_breadcrumbs
  before_action :set_event, only: [:show, :edit, :update]


  def index
    @events = Event.all
  end

  def show
  end

  def new
    @event = Event.new
    render_form :new
  end

  def create
    @event = Event.new event_params
    @event.sub_events.each { |x| x.event = @event }
    @event.event_participants.each { |x| x.event = @event }
    if @event.valid?
      @event.save
      redirect_to @event
    else
      render_form :new
    end
  end

  def edit
    render_form :edit
  end

  def update
    if @event.update_attributes event_params
      redirect_to @event
    else
      render_form :edit
    end
  end

  private
  def set_breadcrumbs
    @breadcrumbs = [ { text: 'Events', path: events_path } ]
  end

  def set_event
    @event = Event.includes(experiences: [ thing_instance: [ :thing, :space_time ],
                            when_and_where: [] ])
      .find(params[:id])
  end

  def render_form(view)
    things = Thing.includes(instances: [ :space_time ]).all
    @locations = things.select { |x| x.location? }
    @timeline_points = TimelinePoint
      .includes(thing_instance: [ :thing, :space_time ])
      .all

    if @event.sub_events.length == 0
      @event.sub_events.build
    end

    if @event.event_experiences.length == 0
      @event.event_experiences.build
    end

    render view
  end

  def event_params
    params.require(:event)
      .permit(
        :summary,
        event_experiences_attributes: [ :id, :timeline_point_id ],
        sub_events_attributes: [ :id, :description ]
      )
  end
end
