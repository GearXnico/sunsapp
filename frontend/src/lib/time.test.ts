import { describe, expect, it } from "vitest";
import { formatTime, formatUtcOffset, parseTime } from "./time";

describe("parseTime", () => {
  it("converts HH:MM to minutes since midnight", () => {
    expect(parseTime("00:00")).toBe(0);
    expect(parseTime("06:45")).toBe(405);
    expect(parseTime("18:30")).toBe(1110);
    expect(parseTime("23:59")).toBe(1439);
  });

  it("accepts a one-digit hour and optional seconds", () => {
    expect(parseTime("7:05")).toBe(425);
    expect(parseTime("07:05:59")).toBe(425);
    expect(parseTime("7:05:00")).toBe(425);
  });

  it("returns null for empty or non-string values", () => {
    expect(parseTime("")).toBeNull();
    expect(parseTime(null)).toBeNull();
    expect(parseTime(undefined)).toBeNull();
    expect(parseTime(42)).toBeNull();
  });

  // Bug: the old API formats reached the chart as wrong or NaN values.
  it("rejects 12-hour times instead of ignoring AM/PM", () => {
    expect(parseTime("8:38:05 PM")).toBeNull();
    expect(parseTime("8:38 AM")).toBeNull();
  });

  it("rejects ISO 8601 timestamps instead of returning NaN", () => {
    expect(parseTime("2026-06-21T05:41:58-04:00")).toBeNull();
  });

  it("rejects out-of-range and malformed values", () => {
    expect(parseTime("24:00")).toBeNull();
    expect(parseTime("12:60")).toBeNull();
    expect(parseTime("12:00:60")).toBeNull();
    expect(parseTime("123:00")).toBeNull();
    expect(parseTime("12:5")).toBeNull();
    expect(parseTime(" 12:00")).toBeNull();
    expect(parseTime("12-00")).toBeNull();
  });
});

describe("formatTime", () => {
  it("converts minutes since midnight to zero-padded HH:MM", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(405)).toBe("06:45");
    expect(formatTime(1110)).toBe("18:30");
    expect(formatTime(1440)).toBe("24:00");
  });
});

describe("formatUtcOffset", () => {
  it("formats whole-hour offsets", () => {
    expect(formatUtcOffset(-180)).toBe("UTC−3");
    expect(formatUtcOffset(540)).toBe("UTC+9");
    expect(formatUtcOffset(0)).toBe("UTC");
  });

  it("formats offsets with minutes", () => {
    expect(formatUtcOffset(330)).toBe("UTC+5:30");
    expect(formatUtcOffset(345)).toBe("UTC+5:45");
    expect(formatUtcOffset(-570)).toBe("UTC−9:30");
  });
});
