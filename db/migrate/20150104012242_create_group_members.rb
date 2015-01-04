class CreateGroupMembers < ActiveRecord::Migration
  def change
    create_table :group_members do |t|
      t.references :group, index: true, null: false
      t.references :thing_instance, index: true, null: false
      t.references :joined_at, class_name: "Event", index: true, null: false

      t.timestamps null: false
    end
    add_foreign_key :group_members, :groups
    add_foreign_key :group_members, :thing_instances
    add_foreign_key :group_members, :events, column: :joined_at_id
  end
end
