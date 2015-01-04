class ThingsController < ApplicationController
  def index
    @things = Thing.includes(instances: [ :space_time ]).all
  end

  def show
    @thing = Thing.find params[:id]
    if @thing.nil?
      head :not_found
    end
  end

  def new
    init_form_view_model(Thing.new)
  end

  def create
    thing = Thing.new thing_params
    thing.instances.each { |x| x.thing = thing }
    if thing.valid?
      thing.save
      redirect_to thing
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

  def update
    thing = Thing.find params[:id]
    if thing.update_attributes thing_params
      redirect_to thing
    else
      logger.info 'Validation failed'
      logger.info thing.errors.to_json
      init_form_view_model(thing)
      render 'edit'
    end
  end

  def new_instance
    thing = Thing.find params[:id]
    if thing.nil?
      head :not_found
    end
    init_instance_form_view_model(ThingInstance.new thing: thing)
  end

  def create_instance
    thing = Thing.find params[:id]
    if thing.nil?
      head :not_found
    else
      instance = ThingInstance.new instance_params
      instance.thing = thing
      if instance.valid?
        instance.save
        redirect_to thing
      else
        logger.info 'Validation failed'
        logger.info instance.errors.to_json
        init_instance_form_view_model(instance)
        render 'new_instance'
      end
    end
  end

  private
  def init_form_view_model(thing)
    @space_times = SpaceTime.all
    @thing = thing
    if thing.instances.length == 0
      thing.instances.build
    end
  end

  def init_instance_form_view_model(instance)
    @space_times = SpaceTime.all
    @instance = instance
  end

  def thing_params
    params.require(:thing).permit(:name, :category, instances_attributes: [ :id, :space_time_id ])
  end

  def instance_params
    params.require(:thing_instance).permit(:space_time_id)
  end
end
