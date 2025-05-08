class CreateSunCycleData < ActiveRecord::Migration[8.0]
  def change
    create_table :sun_cycle_data do |t|
      t.string :location
      t.date :start_date
      t.date :end_date
      t.string :sunrise
      t.string :sunset
      t.string :golden_hour
      t.float :lat
      t.float :long

      t.timestamps
    end
  end
end
