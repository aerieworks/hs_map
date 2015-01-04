class ThingInstance < ActiveRecord::Base
  belongs_to :thing
  belongs_to :space_time
  belongs_to :initial_location, class_name: "ThingInstance"
  has_and_belongs_to_many :events

  validates :thing, :space_time, presence: true
  validates :initial_location, presence: true, allow_nil: true
end
