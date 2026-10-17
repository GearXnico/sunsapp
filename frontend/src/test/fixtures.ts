import type { SunCycleResponse } from "../api/types";

export const sunCycle: SunCycleResponse = {
  location: "Santiago",
  matched_place: "Santiago, Región Metropolitana de Santiago, Chile",
  timezone: "America/Santiago",
  days: [
    {
      date: "2026-06-21",
      first_light: "06:47",
      dawn: "07:19",
      sunrise: "07:46",
      solar_noon: "12:44",
      golden_hour: "17:05",
      sunset: "17:42",
      dusk: "18:09",
      last_light: "18:41",
      utc_offset: -240,
    },
    {
      date: "2026-06-22",
      first_light: "06:48",
      dawn: "07:20",
      sunrise: "07:47",
      solar_noon: "12:45",
      golden_hour: "17:06",
      sunset: "17:43",
      dusk: "18:10",
      last_light: "18:42",
      utc_offset: -240,
    },
  ],
};

// Santiago switches from UTC−4 to UTC−3 on the first Sunday of September.
export const sunCycleDstChange: SunCycleResponse = {
  location: "Santiago",
  matched_place: "Santiago, Región Metropolitana de Santiago, Chile",
  timezone: "America/Santiago",
  days: [
    {
      date: "2026-09-05",
      first_light: "05:56",
      dawn: "06:55",
      sunrise: "07:21",
      solar_noon: "13:00",
      golden_hour: "18:04",
      sunset: "18:39",
      dusk: "19:05",
      last_light: "20:04",
      utc_offset: -240,
    },
    {
      date: "2026-09-06",
      first_light: "06:55",
      dawn: "07:54",
      sunrise: "08:20",
      solar_noon: "14:00",
      golden_hour: "19:05",
      sunset: "19:40",
      dusk: "20:06",
      last_light: "21:05",
      utc_offset: -180,
    },
  ],
};

// Polar night in Tromsø: no sunrise, sunset, golden hour or twilight, only solar noon.
export const sunCyclePolarNight: SunCycleResponse = {
  location: "Tromsø",
  matched_place: null,
  timezone: "Europe/Oslo",
  days: [
    {
      date: "2027-01-14",
      first_light: null,
      dawn: null,
      sunrise: null,
      solar_noon: "12:10",
      golden_hour: null,
      sunset: null,
      dusk: null,
      last_light: null,
      utc_offset: 60,
    },
    {
      date: "2027-01-15",
      first_light: "08:40",
      dawn: "10:30",
      sunrise: "11:48",
      solar_noon: "12:10",
      golden_hour: "11:50",
      sunset: "12:33",
      dusk: "13:51",
      last_light: "15:41",
      utc_offset: 60,
    },
  ],
};
