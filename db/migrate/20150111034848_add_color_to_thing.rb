class AddColorToThing < ActiveRecord::Migration
  def change
    change_table :things do |t|
      t.string :color, limit: 30
    end
  end
end
