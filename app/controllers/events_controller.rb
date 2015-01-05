class EventsController < ApplicationController
  before_action :set_breadcrumbs
  before_action :set_event, only: [:show, :edit, :update]


  def index
    @events = Event.includes(event_participants: [ :location ],
                             participants: [ :thing, :space_time ]).all
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

  def new_instance
    event = Event.find params[:id]
    if event.nil?
      head :not_found
    end
    init_instance_form_view_model(EventInstance.new event: event)
  end

  def create_instance
    event = Event.find params[:id]
    if event.nil?
      head :not_found
    else
      instance = EventInstance.new instance_params
      instance.event = event
      if instance.valid?
        instance.save
        redirect_to event
      else
        logger.info 'Validation failed'
        logger.info instance.errors.to_json
        init_instance_form_view_model(instance)
        render 'new_instance'
      end
    end
  end

  private
  def set_breadcrumbs
    @breadcrumbs = [ { text: 'Events', path: events_path } ]
  end

  def set_event
    @event = Event.find(params[:id])
    head :not_found if @event.nil?
  end

  def render_form(view)
    things = Thing.includes(instances: [ :space_time ]).all
    @locations = things.select { |x| x.location? }
    @participants = things.select { |x| not x.location? }

    if @event.sub_events.length == 0
      @event.sub_events.build
    end

    if @event.event_participants.length == 0
      @event.event_participants.build
    end

    render view
  end

  def event_params
    params.require(:event)
      .permit(
        :summary,
        event_participants_attributes: [ :id, :location_id, :thing_instance_id, :local_time,
          :is_local_time_known, :sequence_index, :is_sequence_index_known ],
        sub_events_attributes: [ :id, :description ]
      )
  end
end
