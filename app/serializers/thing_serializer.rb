class ThingSerializer < ActiveModel::Serializer
  attributes :id, :name, :category, :color

  def attributes
    attrs = super
    attrs[:instances] = object.instances.map do |x|
      { id: x.id, thing_id: object.id, space_time_id: x.space_time_id }
    end
    return attrs
  end
end
