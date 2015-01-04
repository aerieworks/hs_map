class Event < ActiveRecord::Base
  belongs_to :space_time
  belongs_to :location, class_name: "ThingInstance"
end
