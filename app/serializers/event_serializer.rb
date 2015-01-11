class EventSerializer < ActiveModel::Serializer
  attributes :id, :summary

  def attributes
    attrs = super
    attrs[:details] = object.sub_events.map { |x| x.description }
    attrs[:experiences] = object.event_experiences.map { |x| x.id }
    return attrs
  end
end
