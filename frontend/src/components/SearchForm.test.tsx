import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SearchForm from "./SearchForm";
import { fetchSunCycle } from "../api/client";
import { sunCycleDays } from "../test/fixtures";

vi.mock("../api/client", () => ({ fetchSunCycle: vi.fn() }));

const fetchMock = vi.mocked(fetchSunCycle);

function setup() {
  const setResults = vi.fn();
  const setLoading = vi.fn();
  const { container } = render(<SearchForm setResults={setResults} setLoading={setLoading} />);
  return { setResults, setLoading, form: container.querySelector("form")! };
}

async function fill(location: string, start: string, end: string) {
  const user = userEvent.setup();
  if (location) await user.type(screen.getByPlaceholderText("Location"), location);
  if (start) await user.type(screen.getByLabelText("Start Date"), start);
  if (end) await user.type(screen.getByLabelText("End Date"), end);
  await user.click(screen.getByRole("button", { name: "Search" }));
}

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

describe("SearchForm", () => {
  let alertSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    fetchMock.mockReset();
  });

  it("asks to fill in all fields when one is missing", async () => {
    const { form } = setup();
    form.noValidate = true;
    await fill("Santiago", "2026-06-21", "");

    expect(alertSpy).toHaveBeenCalledWith("Please fill in all fields.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a blank location", async () => {
    const { form } = setup();
    form.noValidate = true;
    await fill("   ", "2026-06-21", "2026-06-22");

    expect(alertSpy).toHaveBeenCalledWith("Please enter a location.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a start date after the end date", async () => {
    const { form } = setup();
    form.noValidate = true;
    await fill("Santiago", "2026-06-22", "2026-06-21");

    expect(alertSpy).toHaveBeenCalledWith("Start date must be before end date.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls the API and passes the results up", async () => {
    fetchMock.mockResolvedValue(sunCycleDays);
    const { setResults, setLoading } = setup();
    await fill("Santiago", "2026-06-21", "2026-06-22");

    expect(fetchMock).toHaveBeenCalledWith({
      location: "Santiago",
      start_date: "2026-06-21",
      end_date: "2026-06-22",
    });
    expect(setResults).toHaveBeenCalledWith(sunCycleDays);
    expect(setLoading).toHaveBeenNthCalledWith(1, true);
    expect(setLoading).toHaveBeenLastCalledWith(false);
  });

  it.each([
    [400, "Bad Request: Invalid date"],
    [404, "Not Found: Invalid date"],
    [500, "Server Error: Invalid date"],
    [422, "Unexpected error: Invalid date"],
  ])("alerts the server error for status %i and clears results", async (status, message) => {
    fetchMock.mockRejectedValue(axiosError(status, "Invalid date"));
    const { setResults } = setup();
    await fill("Santiago", "2026-06-21", "2026-06-22");

    expect(alertSpy).toHaveBeenCalledWith(message);
    expect(setResults).toHaveBeenCalledWith([]);
  });

  it("alerts when the server does not respond", async () => {
    fetchMock.mockRejectedValue(axiosError());
    setup();
    await fill("Santiago", "2026-06-21", "2026-06-22");

    expect(alertSpy).toHaveBeenCalledWith("No response from server. Check your connection.");
  });

  it("alerts other request errors", async () => {
    fetchMock.mockRejectedValue(new Error("boom"));
    setup();
    await fill("Santiago", "2026-06-21", "2026-06-22");

    expect(alertSpy).toHaveBeenCalledWith("Request error: boom");
  });
});
