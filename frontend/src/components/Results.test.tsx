import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Results from "./Results";
import { sunCycle, sunCycleDstChange, sunCyclePolarNight } from "../test/fixtures";

vi.mock("./ResultsChart", () => ({ default: () => <div data-testid="results-chart" /> }));

describe("Results", () => {
  it("shows the location, the zone, the chart and one row per day", () => {
    render(<Results data={sunCycle} />);

    expect(screen.getByRole("heading", { name: "Santiago" })).toBeInTheDocument();
    expect(screen.getByText("Showing Santiago, Región Metropolitana de Santiago, Chile")).toBeInTheDocument();
    expect(screen.getByText("Times in America/Santiago (UTC−4)")).toBeInTheDocument();
    expect(screen.getByTestId("results-chart")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Golden hour (evening)" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "UTC offset" })).not.toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3); // header + 2 days
    expect(rows[1]).toHaveTextContent("2026-06-2107:4617:4217:05");
    expect(screen.getByRole("button", { name: "Export CSV" })).toBeInTheDocument();
  });

  it("shows the offset per row when it changes inside the range (DST)", () => {
    render(<Results data={sunCycleDstChange} />);

    expect(screen.getByText("Times in America/Santiago")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "UTC offset" })).toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("2026-09-0507:2118:3918:04UTC−4");
    expect(rows[2]).toHaveTextContent("2026-09-0608:2019:4019:05UTC−3");
  });

  it("shows a dash for missing times", () => {
    render(<Results data={sunCyclePolarNight} />);

    expect(screen.getByText("Times in Europe/Oslo (UTC+1)")).toBeInTheDocument();
    expect(screen.queryByText(/^Showing/)).not.toBeInTheDocument();
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("2027-01-14———");
  });
});
