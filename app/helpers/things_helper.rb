module ThingsHelper
  def describe_thing_instance(thing_instance, thing=nil)
    if thing.nil?
      thing = thing_instance.thing
    end
    "#{thing_instance.space_time.name}!#{thing.name}"
  end
end
