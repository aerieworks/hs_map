class TimeLabelsController < ApplicationController
  before_action :set_breadcrumbs
  before_action :set_time_label, only: [:show, :edit, :update]

  def index
    @time_labels = TimeLabel.includes(:space_time).all
  end

  def show
  end

  def new
    @time_label = TimeLabel.new
    render_form :new
  end

  def edit
    render_form :edit
  end

  def create
    @time_label = TimeLabel.new(time_label_params)
    if @time_label.save
      redirect_to @time_label
    else
      render_form :new
    end
  end

  def update
    if @time_label.update(time_label_params)
      redirect_to @time_label
    else
      render_form :edit
    end
  end

  private
    def set_breadcrumbs
      @breadcrumbs = [ { text: 'Time Labels', path: time_labels_path } ]
    end

    # Use callbacks to share common setup or constraints between actions.
    def set_time_label
      @time_label = TimeLabel.includes(:space_time).find(params[:id])
      head :not_found if @time_label.nil?
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def time_label_params
      params.require(:time_label).permit(:space_time_id, :sequence_index, :description)
    end

    def render_form(form)
      @space_times = SpaceTime.all
      render form
    end
end
