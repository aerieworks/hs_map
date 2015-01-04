class GroupMember < ActiveRecord::Base
  belongs_to :group
  belongs_to :thing_instance
  belongs_to :joined_at, class_name: "Event"
end
