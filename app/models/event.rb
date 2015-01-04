class Event < ActiveRecord::Base
  belongs_to :space_time
  belongs_to :location, class_name: 'ThingInstance'
  has_and_belongs_to_many :participants, class_name: 'ThingInstance', join_table: 'event_participants'
  has_many :sub_events
end
