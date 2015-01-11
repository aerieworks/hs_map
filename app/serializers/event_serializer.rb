class EventSerializer < ActiveModel::Serializer
  attributes :id, :summary

  def attributes
    attrs = super
    attrs[:details] = object.sub_events.map { |x| x.description }
    attrs[:timeline_point_ids] = object.event_experiences.map { |x| x.timeline_point_id }
    return attrs
  end
end
