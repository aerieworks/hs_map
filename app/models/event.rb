class Event < ActiveRecord::Base
  has_many :event_experiences
  has_many :experiences, class_name: 'TimelinePoint', through: :event_experiences, source: :timeline_point

  validates :summary, presence: true, length: { maximum: 50 }
  validates_associated :event_experiences

  accepts_nested_attributes_for :event_experiences
end
