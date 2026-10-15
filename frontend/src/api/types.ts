// GET /api/sun_cycle response (contract v2). Times are local to `timezone`, 24-hour "HH:MM",
// and may be null (polar day or night). `utc_offset` is minutes from UTC for that day.
export interface SunCycleDay {
  date: string;
  sunrise: string | null;
  sunset: string | null;
  // Start of the evening golden hour
  golden_hour: string | null;
  utc_offset: number;
}

export interface SunCycleResponse {
  location: string;
  // IANA time zone name, for example "America/Santiago"
  timezone: string;
  days: SunCycleDay[];
}

export interface SunCycleParams {
  location: string;
  start_date: string;
  end_date: string;
}
