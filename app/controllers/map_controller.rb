class MapController < ApplicationController
  def edit
  end

  def map
    @space_times = to_map SpaceTime.all
    @things = to_map Thing.includes(:instances).all
    @events = to_map Event.includes(:sub_events, :event_participants).all

    @containers = { '' => [] }
    @thing_instances = to_map ThingInstance.all
    @thing_instances.values.each { |x|
      if @things[x.thing_id].location?
        c_id = x.initial_location_id
        if c_id.nil?
          @containers[''].push x.id
        elsif @things[@thing_instances[c_id].thing_id].location?
          @containers[c_id] = [] unless @containers.key? c_id
          @containers[c_id].push x.id
        end
      end
    }
  end

  private
  def to_map(list)
    list.each_with_object({}) { |x, m| m[x.id] = x }
  end
end
