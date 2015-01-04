class MapController < ApplicationController
  def edit
  end

  def map
    @things = Thing.includes(instances: [ :space_time ])

    events = Event.includes(
        :space_time,
        :sub_events,
        location: [ :thing, :space_time ],
        participants: [ :thing, :space_time ]
      ).all
    @space_time_events = events.each_with_object({}) { |x, map|
      if not map.key? x.space_time
        map[x.space_time] = []
      end
      map[x.space_time].push x
    }
  end
end
