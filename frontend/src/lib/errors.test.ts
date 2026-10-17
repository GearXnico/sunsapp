import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { searchError } from "./errors";

function axiosError(status?: number, error?: string): AxiosError {
  const err = new AxiosError("Request failed");
  if (status) {
    err.response = {
      status,
      statusText: "",
      data: error ? { error } : {},
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
  } else {
    err.request = {};
  }
  return err;
}

describe("searchError", () => {
  it.each([
    ["Missing parameters", "Please fill in all fields.", undefined],
    ["Invalid location", "We couldn't find that place.", "location"],
    ["Invalid date format", "One of the dates is not valid.", "dates"],
    ["Invalid date range", "The start date must be before the end date.", "dates"],
    ["Date range cannot exceed 366 days", "The range is too long.", "dates"],
    ["2040-01-01 exceeds the allowed future limit (10 years from today).", "That date is too far ahead.", "dates"],
    ["Something new", "Please check the search and try again.", undefined],
  ])("maps the 400 %j to plain words", (api, title, field) => {
    const result = searchError(axiosError(400, api));

    expect(result.title).toBe(title);
    expect(result.field).toBe(field);
    expect(JSON.stringify(result)).not.toContain("Bad Request");
  });

  it("gives a hint for a place the geocoder does not find", () => {
    expect(searchError(axiosError(400, "Invalid location")).hint).toBe(
      'Try a more specific name, for example "Santiago, Chile".',
    );
  });

  it.each([
    [404, "No sun times for this place and dates."],
    [429, "Too many searches."],
    [500, "Something went wrong on our side."],
    [503, "Something went wrong on our side."],
  ])("maps status %i to a clear message without the API text", (status, title) => {
    const result = searchError(axiosError(status, "Internal server error"));

    expect(result.title).toBe(title);
    expect(JSON.stringify(result)).not.toContain("Internal server error");
  });

  it("says when the server does not answer", () => {
    expect(searchError(axiosError()).title).toBe("We couldn't reach the server.");
  });

  it("never shows the message of an unexpected error", () => {
    const result = searchError(new Error("TypeError at line 3"));

    expect(result.title).toBe("Something went wrong.");
    expect(JSON.stringify(result)).not.toContain("line 3");
  });
});
