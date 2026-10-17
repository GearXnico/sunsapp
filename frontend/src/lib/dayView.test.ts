import { describe, expect, it } from "vitest";
import type { SunCycleDay } from "../api/types";
import { dayLength, dayStages, formatDuration, formatLengthChange, morningGoldenEnd, skyDescription } from "./dayView";
import { sunCycle, sunCyclePolarNight } from "../test/fixtures";

const santiago = sunCycle.days[0]!;
const polarNight = sunCyclePolarNight.days[0]!;
const polarDawn = sunCyclePolarNight.days[1]!;
const range = (stages: ReturnType<typeof dayStages>) => stages.map(({ name, start, end }) => `${name} ${start}-${end}`);

describe("morningGoldenEnd", () => {
  it("mirrors the evening golden hour start around solar noon", () => {
    // noon 12:44 (764), golden hour 17:05 (1025): 2 × 764 − 1025 = 503 (08:23)
    expect(morningGoldenEnd(santiago)).toBe(503);
  });

  it("stays between sunrise and the evening start on very short days", () => {
    // noon 12:10, golden hour 11:50: the mirror (12:30) would pass the evening start
    expect(morningGoldenEnd(polarDawn)).toBe(710);
    // a golden hour start far after noon would mirror before sunrise
    expect(morningGoldenEnd({ ...santiago, golden_hour: "23:00" })).toBe(466);
  });

  it("is null when a time it needs is missing", () => {
    expect(morningGoldenEnd(polarNight)).toBeNull();
    expect(morningGoldenEnd({ ...santiago, solar_noon: null })).toBeNull();
  });
});

describe("dayStages", () => {
  it("returns the stages of the day from midnight to midnight", () => {
    const stages = dayStages(santiago);

    expect(range(stages)).toEqual([
      "Night 0-407",
      "Twilight 407-439",
      "Blue hour 439-466",
      "Golden hour 466-503",
      "Daylight 503-1025",
      "Golden hour 1025-1062",
      "Blue hour 1062-1089",
      "Twilight 1089-1121",
      "Night 1121-1440",
    ]);
    expect(stages.map((stage) => stage.color)).toEqual([
      "night",
      "blue",
      "blue",
      "gold",
      "day",
      "gold",
      "blue",
      "blue",
      "night",
    ]);
    expect(stages[4]!.note).toBe("Solar noon at 12:44");
  });

  it("leaves out stages with unknown ends (polar night)", () => {
    expect(dayStages(polarNight)).toEqual([]);
  });

  it("leaves out stages that do not move forward", () => {
    // golden hour before solar noon: no daylight stage between the two golden hours
    expect(range(dayStages(polarDawn))).not.toContain("Daylight 710-710");
    expect(dayStages(polarDawn).map((stage) => stage.name)).toEqual([
      "Night",
      "Twilight",
      "Blue hour",
      "Golden hour",
      "Golden hour",
      "Blue hour",
      "Twilight",
      "Night",
    ]);
  });

  it("drops the solar noon note when solar noon is missing", () => {
    const day: SunCycleDay = { ...santiago, solar_noon: null };
    expect(dayStages(day).every((stage) => !stage.note.includes("Solar noon"))).toBe(true);
  });
});

describe("dayLength", () => {
  it("is the minutes from sunrise to sunset", () => {
    expect(dayLength(santiago)).toBe(596);
  });

  it("is null when sunrise or sunset is missing or out of order", () => {
    expect(dayLength(polarNight)).toBeNull();
    expect(dayLength({ ...santiago, sunset: "05:00" })).toBeNull();
  });
});

describe("formatDuration", () => {
  it("formats hours and zero-padded minutes", () => {
    expect(formatDuration(782)).toBe("13 h 02 min");
    expect(formatDuration(45)).toBe("0 h 45 min");
  });
});

describe("formatLengthChange", () => {
  it("shows the signed change in minutes", () => {
    expect(formatLengthChange(598, 596)).toBe("+2 min");
    expect(formatLengthChange(595, 596)).toBe("−1 min");
    expect(formatLengthChange(596, 596)).toBe("No change");
  });

  it("uses hours for changes of an hour or more", () => {
    expect(formatLengthChange(45, 107)).toBe("−1 h 02 min");
  });
});

describe("skyDescription", () => {
  it("lists the known times of the day", () => {
    expect(skyDescription(santiago)).toBe(
      "Sky on 2026-06-21: first light 06:47, dawn 07:19, sunrise 07:46, solar noon 12:44, " +
        "golden hour 17:05, sunset 17:42, dusk 18:09, last light 18:41",
    );
    expect(skyDescription(polarNight)).toBe("Sky on 2027-01-14: solar noon 12:10");
  });

  it("says when no time is known", () => {
    expect(skyDescription({ ...polarNight, solar_noon: null })).toBe("Sky on 2027-01-14: no sun times");
  });
});
