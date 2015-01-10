class ThingInstance < ActiveRecord::Base
  belongs_to :thing
  belongs_to :space_time
  has_and_belongs_to_many :events

  validates :thing, :space_time, presence: true
end
