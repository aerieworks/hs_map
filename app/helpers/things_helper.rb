module ThingsHelper
  def describe_thing_instance(thing_instance, thing=nil)
    if thing.nil?
      thing = thing_instance.thing
    end
    "#{thing_instance.space_time.name}!#{thing.name}"
  end

  def thing_instances_for_selection(things, options={})
    if things.length == 0
      instances = []
    elsif things.first.respond_to? :instances
      instances = things.map do |thing|
        thing.instances.map do |instance|
          [ describe(instance, thing), instance.id ]
        end
      end
      instances.flatten!(1)
    elsif things.first.respond_to? :thing
      instances = things.map { |x| [ describe(x), x.id ] }
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
end
