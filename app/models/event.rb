class Event < ActiveRecord::Base
  has_many :sub_events
  has_many :event_participants
  has_many :participants, class_name: 'ThingInstance', through: :event_participants, source: :thing_instance

  validates :summary, presence: true, length: { maximum: 50 }
  validates_associated :sub_events, :event_participants

  accepts_nested_attributes_for :sub_events, :event_participants

  def descriptions
    sub_events.map { |x| x.description }
  end
end
