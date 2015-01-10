class EventExperience < ActiveRecord::Base
  belongs_to :event
  belongs_to :timeline_point

  validates :event, :timeline_point, presence: true
end

