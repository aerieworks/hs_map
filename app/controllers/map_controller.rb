class MapController < ApplicationController
  def edit
  end

  def map
    @space_times = to_map SpaceTime.all
    @things = to_map Thing.includes(:instances).all
    @events = to_map Event.includes(:sub_events, :event_experiences).all

    @containers = { '' => [] }
    @thing_instances = to_map ThingInstance.all
  end

  private
  def to_map(list)
    list.each_with_object({}) { |x, m| m[x.id] = x }
  end
end
