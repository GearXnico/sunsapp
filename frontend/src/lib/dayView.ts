import type { SunCycleDay } from "../api/types";
import { formatTime, parseTime } from "./time";

export type StageColor = "night" | "blue" | "gold" | "day";

// One stage of the day, in minutes since local midnight.
export interface Stage {
  name: string;
  color: StageColor;
  start: number;
  end: number;
  note: string;
}

const MINUTES_PER_DAY = 24 * 60;

// The API sends only the start of the evening golden hour. The morning one ends at that start
// mirrored around solar noon (approximation, ADR 0018), kept between sunrise and the evening start
// so stages never overlap on very short days.
export function morningGoldenEnd(day: SunCycleDay): number | null {
  const sunrise = parseTime(day.sunrise);
  const noon = parseTime(day.solar_noon);
  const golden = parseTime(day.golden_hour);
  if (sunrise === null || noon === null || golden === null) return null;
  return Math.min(Math.max(2 * noon - golden, sunrise), golden);
}

// Stages from midnight to midnight. A stage whose start or end is unknown (null, polar day or
// night) or that does not move forward is left out, so the band leaves a gap instead of guessing.
export function dayStages(day: SunCycleDay): Stage[] {
  const t = (value: string | null) => parseTime(value);
  const noonNote = day.solar_noon ? `Solar noon at ${day.solar_noon}` : "";
  const stages: (Omit<Stage, "start" | "end"> & { start: number | null; end: number | null })[] = [
    { name: "Night", color: "night", start: 0, end: t(day.first_light), note: "" },
    { name: "Twilight", color: "blue", start: t(day.first_light), end: t(day.dawn), note: "First light to dawn" },
    { name: "Blue hour", color: "blue", start: t(day.dawn), end: t(day.sunrise), note: "Soft, cool light" },
    {
      name: "Golden hour",
      color: "gold",
      start: t(day.sunrise),
      end: morningGoldenEnd(day),
      note: "Morning, warm and low",
    },
    { name: "Daylight", color: "day", start: morningGoldenEnd(day), end: t(day.golden_hour), note: noonNote },
    {
      name: "Golden hour",
      color: "gold",
      start: t(day.golden_hour),
      end: t(day.sunset),
      note: "Evening, warm and low",
    },
    { name: "Blue hour", color: "blue", start: t(day.sunset), end: t(day.dusk), note: "Sunset to dusk" },
    { name: "Twilight", color: "blue", start: t(day.dusk), end: t(day.last_light), note: "Dusk to last light" },
    { name: "Night", color: "night", start: t(day.last_light), end: MINUTES_PER_DAY, note: "" },
  ];
  return stages.flatMap(({ start, end, ...stage }) =>
    start !== null && end !== null && start < end ? [{ ...stage, start, end }] : [],
  );
}

// Minutes between sunrise and sunset, or null when either is unknown.
export function dayLength(day: SunCycleDay): number | null {
  const sunrise = parseTime(day.sunrise);
  const sunset = parseTime(day.sunset);
  if (sunrise === null || sunset === null || sunset < sunrise) return null;
  return sunset - sunrise;
}

// 782 → "13 h 02 min"
export function formatDuration(minutes: number): string {
  return `${Math.floor(minutes / 60)} h ${(minutes % 60).toString().padStart(2, "0")} min`;
}

// Change of day length against the previous day of the range: "+3 min", "−1 h 02 min", "No change".
export function formatLengthChange(current: number, previous: number): string {
  const diff = current - previous;
  if (diff === 0) return "No change";
  const abs = Math.abs(diff);
  const text = abs < 60 ? `${abs} min` : formatDuration(abs);
  return `${diff > 0 ? "+" : "−"}${text}`;
}

// Text alternative for the sky band.
export function skyDescription(day: SunCycleDay): string {
  const times: [string, number | null][] = [
    ["first light", parseTime(day.first_light)],
    ["dawn", parseTime(day.dawn)],
    ["sunrise", parseTime(day.sunrise)],
    ["solar noon", parseTime(day.solar_noon)],
    ["golden hour", parseTime(day.golden_hour)],
    ["sunset", parseTime(day.sunset)],
    ["dusk", parseTime(day.dusk)],
    ["last light", parseTime(day.last_light)],
  ];
  const known = times.flatMap(([label, value]) => (value === null ? [] : [`${label} ${formatTime(value)}`]));
  const detail = known.length > 0 ? known.join(", ") : "no sun times";
  return `Sky on ${day.date}: ${detail}`;
}
