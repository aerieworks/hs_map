class MapController < ApplicationController
  def edit
  end

  def map
    @space_times = SpaceTime.all
    @things = Thing.all
    @events = Event.includes(:sub_events, :event_experiences).all
    @timelines = ThingInstance.all
    @timeline_points = TimelinePoint.all
  end

  private
  def to_map(list)
    list.each_with_object({}) { |x, m| m[x.id] = x }
  end
end
