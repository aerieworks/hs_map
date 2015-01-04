class Thing < ActiveRecord::Base
  enum category: [ :object, :character, :location ]
  has_many :instances, class_name: "ThingInstance"

  validates :name, presence: true, length: { maximum: 50 }
  validates :category, presence: true
  validates_associated :instances

  accepts_nested_attributes_for :instances
end
