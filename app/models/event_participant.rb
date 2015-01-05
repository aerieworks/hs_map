class EventParticipant < ActiveRecord::Base
  belongs_to :event
  belongs_to :thing_instance
  belongs_to :location, class_name: 'ThingInstance'

  validates :event, :thing_instance, :location, presence: true
  validates :local_time, :sequence_index,
    numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end

