module TimelinePointsHelper
  def describe_timeline_point(point, full=true)
    text = "#{describe(point.thing_instance)}"
    unless point.description.nil?
      text += " @ #{point.description}"
    end
    if full and not point.when_and_where.nil?
      text += ' < ' + describe_timeline_point(point.when_and_where, full: full)
    end

    return text
  end

  def select_timeline_point(field, points, value=nil)
    select_tag(field, to_select_options(points, :id, { selected: value }))
  end
end
