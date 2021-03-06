module ApplicationHelper
  def describe(model, *args)
    send("describe_#{model.class.name.tableize.singularize}", model, *args)
  end

  def group_by(enumerable, grouper)
    is_grouper_lambda = grouper.respond_to? :call
    enumerable.each_with_object({}) do |x, m|
      id = (is_grouper_lambda ? grouper.call(x) : x[grouper])
      m[id] = [] unless m.key? id
      m[id].push(block_given? ? yield(x) : x)
    end
  end

  def to_select_options(enumerable, value_source, options={})
    is_value_source_lambda = value_source.respond_to? :call
    tuples = enumerable.collect do |x|
      [
        block_given? ? yield(x) : describe(x),
        is_value_source_lambda ? value_source.call(x) : x[value_source]
      ]
    end
    options_for_select(tuples, options[:selected])
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
