module ApplicationHelper
  def describe(model, *args)
    send("describe_#{model.class.name.tableize.singularize}", model, *args)
  end

  def instance_name(thing_instance, thing=nil)
    describe(thing_instance, thing)
  end

  def display_time(o, time_symbol)
    time = o[time_symbol]
    is_known = o["is_#{time_symbol}_known".to_sym]
    label = TimeLabel.find_by sequence_index: time
    "#{label.nil? ? time.to_s : label.description}#{is_known ? '' : '(?)'}"
  end

  def time_editor(form, field, skip_certainty=false)
    content = form.number_field(field, minimum: 0, step: 1)
    if not skip_certainty
      is_known_field = "is_#{field}_known".to_sym
      content += form.check_box(is_known_field) + form.label(is_known_field, 'Known?', class: 'entity-checkbox-label')
    end

    return content
  end

  def group_by(enumerable, grouper)
    is_grouper_lambda = grouper.respond_to? :call
    enumerable.each_with_object({}) do |x, m|
      id = (is_grouper_lambda ? grouper.call(x) : x[grouper])
      m[id] = [] unless m.key? id
      m[id].push(block_given? ? yield(x) : x)
    end
  end

  def to_select_options(enumerable, value_source, selected=nil)
    is_value_source_lambda = value_source.respond_to? :call
    tuples = enumerable.collect do |x|
      [
        block_given? ? yield(x) : describe(x),
        is_value_source_lambda ? value_source.call(x) : x[value_source]
      ]
    end
    options_for_select(tuples, selected)
  end

  def thing_instances_for_selection(things, options={})
    if things.length == 0
      instances = []
    elsif things.first.respond_to? :instances
      instances = things.map do |thing|
        thing.instances.map do |instance|
          [ instance_name(instance, thing), instance.id ]
        end
      end
      instances.flatten!(1)
    elsif things.first.respond_to? :thing
      instances = things.map { |x| [ instance_name(x), x.id ] }
    else
      instances []
    end

    if options.fetch(:allow_nil, false)
      instances.insert(0, [ '<none>', '' ])
    end

    return instances
  end

  def select_thing_instance(form, field, things)
    form.select(field, thing_instances_for_selection(things))
  end

  def select_timeline_point(field, points, value=nil)
      select_tag(field, options_for_select(points.map { |x| [ x.description, x.id ] }, value))
  end

  def editor_for(builder, association, locals={})
    builder.fields_for(association) { |f|
      locals[:f] = f
      render association.to_s.singularize + '_editor', locals
    }
  end

  def editor_for_each(heading, builder, association, locals={})
    content = "<div class=\"entity-child-list\"><h3>#{h heading}</h3>" +
      editor_for(builder, association, locals) +
      button_to_add_editor(builder, association, locals) +
    '</div>'
    content.html_safe
  end

  def button_to_add_editor(builder, association, locals={})
    new_object = builder.object.class.reflect_on_association(association).klass.new
    mock_id = "new_#{association}"
    editor_content = builder.fields_for(association, new_object, child_index: mock_id) { |f|
      locals[:f] = f
      render association.to_s.singularize + '_editor', locals
    }
    button_tag 'Add', type: :button, class: 'add-editor', data: {
      editor_content: CGI.escapeHTML(editor_content),
      mock_id: mock_id
    }
  end
end
