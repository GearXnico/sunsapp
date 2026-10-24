import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, AxiosHeaders } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SearchForm from "./SearchForm";
import { fetchSunCycle } from "../api/client";
import { sunCycle } from "../test/fixtures";

vi.mock("../api/client", () => ({ fetchSunCycle: vi.fn() }));

const fetchMock = vi.mocked(fetchSunCycle);

function setup() {
  const setResults = vi.fn();
  const { container } = render(<SearchForm setResults={setResults} />);
  return { setResults, form: container.querySelector("form")! };
}

async function fill(location: string, start: string, end: string) {
  const user = userEvent.setup();
  if (location) await user.type(screen.getByLabelText("Location"), location);
  if (start) await user.type(screen.getByLabelText("From"), start);
  if (end) await user.type(screen.getByLabelText("To"), end);
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
  beforeEach(() => {
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

    expect(screen.getByRole("alert")).toHaveTextContent("Please fill in all fields.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a blank location", async () => {
    const { form } = setup();
    form.noValidate = true;
    await fill("   ", "2026-06-21", "2026-06-22");

    expect(screen.getByRole("alert")).toHaveTextContent("Please enter a location.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a start date after the end date", async () => {
    const { form } = setup();
    form.noValidate = true;
    await fill("Santiago", "2026-06-22", "2026-06-21");

    expect(screen.getByRole("alert")).toHaveTextContent("The start date must be before the end date.");
    expect(screen.getByLabelText("To")).toHaveAttribute("aria-invalid", "true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("calls the API and passes the results up", async () => {
    fetchMock.mockResolvedValue(sunCycle);
    const { setResults } = setup();
    await fill("Santiago", "2026-06-21", "2026-06-22");

    expect(fetchMock).toHaveBeenCalledWith({
      location: "Santiago",
      start_date: "2026-06-21",
      end_date: "2026-06-22",
    });
    expect(setResults).toHaveBeenCalledWith(sunCycle);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a turning sun and disables Search while the search runs", async () => {
    let resolve: (data: typeof sunCycle) => void = () => {};
    fetchMock.mockReturnValue(new Promise((r) => (resolve = r)));
    setup();
    await fill("Santiago", "2026-06-21", "2026-06-22");

    expect(screen.getByRole("button", { name: "Searching…" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Looking up the sun for Santiago…");
    expect(screen.getByRole("status")).toHaveTextContent(
      "The API sleeps when idle, so the first search can take about a minute.",
    );

    resolve(sunCycle);
    expect(await screen.findByRole("button", { name: "Search" })).toBeEnabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("explains a place the geocoder does not find and marks the location field", async () => {
    fetchMock.mockRejectedValue(axiosError(400, "Invalid location"));
    const { setResults } = setup();
    await fill("Santiagoo", "2026-06-21", "2026-06-22");

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(`We couldn't find that place. Try a more specific name, for example "Santiago, Chile".`);
    expect(alert).not.toHaveTextContent("Bad Request");
    expect(screen.getByLabelText("Location")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Location")).toHaveAccessibleDescription(/We couldn't find that place/);
    expect(screen.getByLabelText("From")).not.toHaveAttribute("aria-invalid");
    expect(setResults).toHaveBeenCalledWith(null);
  });

  it("marks the dates when the server rejects the range", async () => {
    fetchMock.mockRejectedValue(axiosError(400, "Date range cannot exceed 366 days"));
    setup();
    await fill("Santiago", "2025-01-01", "2026-06-22");

    expect(screen.getByRole("alert")).toHaveTextContent("The range is too long.");
    expect(screen.getByLabelText("From")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("To")).toHaveAttribute("aria-invalid", "true");
  });

  it("never shows the server's internal error text", async () => {
    fetchMock.mockRejectedValue(axiosError(500, "Internal server error"));
    setup();
    await fill("Santiago", "2026-06-21", "2026-06-22");

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong on our side.");
    expect(screen.getByRole("alert")).not.toHaveTextContent("Internal server error");
  });

  it("shows an error when the server does not respond", async () => {
    fetchMock.mockRejectedValue(axiosError());
    setup();
    await fill("Santiago", "2026-06-21", "2026-06-22");

    expect(screen.getByRole("alert")).toHaveTextContent("We couldn't reach the server.");
  });

  it("clears the previous error on a new search", async () => {
    fetchMock.mockRejectedValueOnce(axiosError()).mockResolvedValueOnce(sunCycle);
    setup();
    await fill("Santiago", "2026-06-21", "2026-06-22");
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await userEvent.setup().click(screen.getByRole("button", { name: "Search" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows one row without the hint on top of the results", () => {
    const { container } = render(<SearchForm setResults={vi.fn()} compact />);

    expect(container.querySelector("form")).toHaveClass("inline");
    expect(screen.queryByText("Up to 366 days.")).not.toBeInTheDocument();
  });

  it("never uses window.alert", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const { form } = setup();
    form.noValidate = true;
    await fill("", "", "");

    expect(screen.getByRole("alert")).toHaveTextContent("Please fill in all fields.");
    expect(alertSpy).not.toHaveBeenCalled();
  });
});
