class EventParticipant < ActiveRecord::Base
  belongs_to :event
  belongs_to :thing_instance
end
