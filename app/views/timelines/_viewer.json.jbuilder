json.array! timeline do |point|
  json.extract! point, :id, :next_id, :previous_id, :description, :thing_instance_id, :when_and_where_id
  json.instance_name "#{instance_name(point.thing_instance)}"
  json.url timeline_point_url(point, format: :json)
end

