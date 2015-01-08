class TimelinesController < ApplicationController
  def index
    @timelines = TimelinePoint.to_ordered_timelines(
      TimelinePoint.includes(thing_instance: [ :thing, :space_time ]).all
    )
  end

  def show
    @timeline = TimelinePoint.to_ordered_timeline(
      TimelinePoint.includes(thing_instance: [ :thing, :space_time ])
        .where(thing_instance_id: params[:id])
    )
  end
end
