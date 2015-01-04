class Thing < ActiveRecord::Base
  enum category: [ :object, :character, :location ]
end
