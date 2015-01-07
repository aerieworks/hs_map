class TimePoint < ActiveRecord::Base
  belongs_to :space_time
  belongs_to :previous, class_name: 'TimePoint'
  belongs_to :next, class_name: 'TimePoint'

  validates :description, :space_time, presence: true
  validates :description, length: { maximum: 50 }
end
