class TimelinePointSerializer < ActiveModel::Serializer
  attributes :id, :thing_instance_id, :description, :when_and_where_id, :previous_id, :next_id
end
