class Thing < ActiveRecord::Base
  enum category: [ :object, :character, :location ]
  has_many :instances, class_name: "ThingInstance"
end
