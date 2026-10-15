import { describe, expect, it } from "vitest";
import { formatTime, parseTime } from "./time";

describe("parseTime", () => {
  it("converts HH:MM to minutes since midnight", () => {
    expect(parseTime("00:00")).toBe(0);
    expect(parseTime("06:45")).toBe(405);
    expect(parseTime("18:30")).toBe(1110);
  });

  it("returns null for empty or non-string values", () => {
    expect(parseTime("")).toBeNull();
    expect(parseTime(undefined)).toBeNull();
    expect(parseTime(42)).toBeNull();
  });
});

describe("formatTime", () => {
  it("converts minutes since midnight to zero-padded HH:MM", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(405)).toBe("06:45");
    expect(formatTime(1110)).toBe("18:30");
  });
});
