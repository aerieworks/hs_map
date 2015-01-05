class TimeLabel < ActiveRecord::Base
  belongs_to :space_time

  validates :description, :space_time, presence: true
  validates :description, length: { maximum: 50 }
  validates :sequence_index,
    numericality: { only_integer: true, greater_than_or_equal_to: 0 },
    uniqueness: { scope: :space_time, message: 'can only be labeled once per SpaceTime.' }
end
