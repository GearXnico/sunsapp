# Adds the zone of the place to each cached day (ADR 0006). Rows cached before this
# migration hold 12-hour strings with no zone, so they cannot be trusted and are deleted;
# they are fetched again on the next request.
class AddTimezoneToSunCycleData < ActiveRecord::Migration[8.0]
  def change
    add_column :sun_cycle_data, :timezone, :string
    add_column :sun_cycle_data, :utc_offset, :integer

    up_only do
      execute "DELETE FROM sun_cycle_data WHERE timezone IS NULL"
    end
  end
end
