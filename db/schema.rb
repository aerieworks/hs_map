# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150110085748) do

  create_table "event_experiences", force: :cascade do |t|
    t.integer  "event_id",          limit: 4, null: false
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
    t.integer  "timeline_point_id", limit: 4
  end

  add_index "event_experiences", ["event_id"], name: "index_event_experiences_on_event_id", using: :btree
  add_index "event_experiences", ["timeline_point_id"], name: "index_event_experiences_on_timeline_point_id", using: :btree

  create_table "events", force: :cascade do |t|
    t.string   "summary",    limit: 50, null: false
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
  end

  create_table "group_members", force: :cascade do |t|
    t.integer  "group_id",          limit: 4, null: false
    t.integer  "thing_instance_id", limit: 4, null: false
    t.integer  "joined_at_id",      limit: 4, null: false
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
  end

  add_index "group_members", ["group_id"], name: "index_group_members_on_group_id", using: :btree
  add_index "group_members", ["joined_at_id"], name: "index_group_members_on_joined_at_id", using: :btree
  add_index "group_members", ["thing_instance_id"], name: "index_group_members_on_thing_instance_id", using: :btree

  create_table "groups", force: :cascade do |t|
    t.string   "name",       limit: 50
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
  end

  create_table "space_times", force: :cascade do |t|
    t.string   "name",       limit: 50, null: false
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
  end

  create_table "sub_event_sources", force: :cascade do |t|
    t.integer  "event_id",     limit: 4, null: false
    t.string   "source_panel", limit: 6, null: false
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  add_index "sub_event_sources", ["event_id"], name: "index_sub_event_sources_on_event_id", using: :btree

  create_table "sub_events", force: :cascade do |t|
    t.integer  "event_id",    limit: 4,    null: false
    t.string   "description", limit: 1000, null: false
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  add_index "sub_events", ["event_id"], name: "index_sub_events_on_event_id", using: :btree

  create_table "thing_instances", force: :cascade do |t|
    t.integer  "thing_id",      limit: 4, null: false
    t.integer  "space_time_id", limit: 4, null: false
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
  end

  add_index "thing_instances", ["space_time_id"], name: "index_thing_instances_on_space_time_id", using: :btree
  add_index "thing_instances", ["thing_id"], name: "index_thing_instances_on_thing_id", using: :btree

  create_table "things", force: :cascade do |t|
    t.string   "name",       limit: 50, null: false
    t.integer  "category",   limit: 4,  null: false
    t.datetime "created_at",            null: false
    t.datetime "updated_at",            null: false
  end

  create_table "timeline_points", force: :cascade do |t|
    t.string  "description",       limit: 50
    t.integer "previous_id",       limit: 4
    t.integer "next_id",           limit: 4
    t.integer "thing_instance_id", limit: 4
    t.integer "when_and_where_id", limit: 4
  end

  add_index "timeline_points", ["next_id"], name: "index_timeline_points_on_next_id", using: :btree
  add_index "timeline_points", ["previous_id"], name: "index_timeline_points_on_previous_id", using: :btree
  add_index "timeline_points", ["thing_instance_id"], name: "index_timeline_points_on_thing_instance_id", using: :btree
  add_index "timeline_points", ["when_and_where_id"], name: "index_timeline_points_on_when_and_where_id", using: :btree

  add_foreign_key "event_experiences", "events"
  add_foreign_key "event_experiences", "timeline_points"
  add_foreign_key "group_members", "events", column: "joined_at_id"
  add_foreign_key "group_members", "groups"
  add_foreign_key "group_members", "thing_instances"
  add_foreign_key "sub_event_sources", "events"
  add_foreign_key "sub_events", "events"
  add_foreign_key "thing_instances", "space_times"
  add_foreign_key "thing_instances", "things"
  add_foreign_key "timeline_points", "thing_instances"
  add_foreign_key "timeline_points", "timeline_points", column: "next_id"
  add_foreign_key "timeline_points", "timeline_points", column: "previous_id"
  add_foreign_key "timeline_points", "timeline_points", column: "when_and_where_id"
end
