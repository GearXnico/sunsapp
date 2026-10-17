import type { SunCycleResponse } from "../api/types";

export const sunCycle: SunCycleResponse = {
  location: "Santiago",
  matched_place: "Santiago, Región Metropolitana de Santiago, Chile",
  timezone: "America/Santiago",
  days: [
    { date: "2026-06-21", sunrise: "07:46", sunset: "17:42", golden_hour: "17:05", utc_offset: -240 },
    { date: "2026-06-22", sunrise: "07:47", sunset: "17:43", golden_hour: "17:06", utc_offset: -240 },
  ],
};

// Santiago switches from UTC−4 to UTC−3 on the first Sunday of September.
export const sunCycleDstChange: SunCycleResponse = {
  location: "Santiago",
  matched_place: "Santiago, Región Metropolitana de Santiago, Chile",
  timezone: "America/Santiago",
  days: [
    { date: "2026-09-05", sunrise: "07:21", sunset: "18:39", golden_hour: "18:04", utc_offset: -240 },
    { date: "2026-09-06", sunrise: "08:20", sunset: "19:40", golden_hour: "19:05", utc_offset: -180 },
  ],
};

// Polar night in Tromsø: no sunrise, sunset or golden hour.
export const sunCyclePolarNight: SunCycleResponse = {
  location: "Tromsø",
  matched_place: null,
  timezone: "Europe/Oslo",
  days: [
    { date: "2027-01-14", sunrise: null, sunset: null, golden_hour: null, utc_offset: 60 },
    { date: "2027-01-15", sunrise: "11:48", sunset: "12:33", golden_hour: "11:50", utc_offset: 60 },
  ],
};
