module TimelinePointsHelper
  def timeline_point_name(timeline_point)
    "#{instance_name(timeline_point.thing_instance)}: #{timeline_point.description}"
  end

  def describe_timeline_point(point, full=false)
    text = "#{describe(point.thing_instance)}"
    unless point.description.nil?
      text += " @ #{point.description}"
    end
    if full and not point.when_and_where.nil?
      text += ' < ' + describe_timeline_point(point.when_and_where, full: full)
    end

    return text
  end
end
