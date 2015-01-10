class Event < ActiveRecord::Base
  has_many :sub_events
  has_many :event_experiences
  has_many :experiences, class_name: 'TimelinePoint', through: :event_experiences, source: :timeline_point

  validates :summary, presence: true, length: { maximum: 50 }
  validates_associated :sub_events, :event_experiences

  accepts_nested_attributes_for :sub_events, :event_experiences

  def descriptions
    sub_events.map { |x| x.description }
  end
end
