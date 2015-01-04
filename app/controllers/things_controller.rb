class ThingsController < ApplicationController
  def index
    @things = Thing.includes(instances: [ :space_time ]).all
  end

  def new
    init_form_view_model(Thing.new)
  end

  def create
    thing = Thing.new thing_params
    thing.instances.each { |x| x.thing = thing }
    if thing.valid?
      thing.save
      redirect_to thing, :action => :edit
    else
      logger.info 'Validation failed'
      logger.info thing.errors.to_json
      init_form_view_model(thing)
      render 'new'
    end
  end

  def edit
    init_form_view_model(Thing.find params[:id])
  end

  private
  def init_form_view_model(thing)
    @space_times = SpaceTime.all
    @thing = thing
    if thing.instances.length == 0
      thing.instances.build
    end
  end

  def thing_params
    params.require(:thing).permit(:name, :category, instances_attributes: [ :id, :space_time_id ])
  end
end
