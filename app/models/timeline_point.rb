class TimelinePoint < ActiveRecord::Base
  belongs_to :thing_instance
  belongs_to :when_and_where, class_name: 'TimelinePoint'
  belongs_to :previous, class_name: 'TimelinePoint'
  belongs_to :next, class_name: 'TimelinePoint'

  validates :thing_instance, presence: true
  validates :description, length: { maximum: 50 }

  def self.to_ordered_timeline(points)
    return [] if points.empty?

    result = to_ordered_timelines(points)
    return result[points.first.thing_instance_id]
  end

  def self.to_ordered_timelines(points)
    point_map = Hash[points.map { |x| [x.id, x] }]
    timelines = {}
    points.each do |x|
      instance_id = x.thing_instance_id
      unless timelines.key? instance_id
        timelines[instance_id] = []
        until x.nil?
          timelines[instance_id].push x
          x = point_map[x.next_id]
        end

        x = point_map[timelines[instance_id].first.previous_id]
        until x.nil?
          timelines[instance_id].insert(0, x)
          x = point_map[x.previous_id]
        end
      end
    end

    return timelines
  end
end
