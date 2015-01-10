json.array! timeline do |point|
  json.extract! point, :id, :next_id, :previous_id, :thing_instance_id, :when_and_where_id
  json.instance_name "#{describe(point.thing_instance)}"
  json.description "#{describe(point, full: true)}"
  json.url timeline_point_url(point, format: :json)
end

