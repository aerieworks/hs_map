class ThingsController < ApplicationController
  before_action :set_breadcrumbs
  before_action :set_thing, only: [:show, :edit, :update]

  def index
    @things = Thing.includes(instances: [ :space_time ]).all
  end

  def show
  end

  def new
    @thing = Thing.new
    render_form :new
  end

  def create
    @thing = Thing.new thing_params
    @thing.instances.each { |x| x.thing = @thing }
    if @thing.valid?
      @thing.save
      redirect_to @thing
    else
      render_form :new
    end
  end

  def edit
    render_form :edit
  end

  def update
    if @thing.update_attributes thing_params
      redirect_to @thing
    else
      render_form :edit
    end
  end

  private
  def set_breadcrumbs
    @breadcrumbs = [ { text: 'Things', path: things_path } ]
  end

  def set_thing
    @thing = Thing.joins(:instances).joins(instances: :space_time).order('space_times.name ASC').find(params[:id])
  end

  def render_form(view)
    @space_times = SpaceTime.order(name: :asc).all
    @locations = Thing.includes(instances: [ :space_time ])
      .where(category: Thing.categories[:location])
    if @thing.instances.length == 0
      @thing.instances.build
    end
    render view
  end

  def thing_params
    params.require(:thing)
      .permit(:name, :category, :color,
              instances_attributes: [ :id, :space_time_id ])
  end
end
