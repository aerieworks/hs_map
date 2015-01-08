@timelines.each do |key, timeline|
  json.set! key do
    json.partial! 'viewer', timeline: timeline
  end
end
