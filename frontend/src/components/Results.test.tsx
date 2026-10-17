import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Results from "./Results";
import { sunCycle, sunCycleDstChange, sunCyclePolarNight } from "../test/fixtures";

vi.mock("./ResultsChart", () => ({ default: () => <div data-testid="results-chart" /> }));

describe("Results", () => {
  it("shows the day view, the zone and one row per day, with the chart hidden", () => {
    render(<Results data={sunCycle} />);

    expect(screen.getByRole("heading", { name: "Santiago" })).toBeInTheDocument();
    expect(screen.getByText("Showing Santiago, Región Metropolitana de Santiago, Chile")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /^Sky on 2026-06-21/ })).toBeInTheDocument();
    expect(screen.getByText("Times in America/Santiago (UTC−4)")).toBeInTheDocument();
    expect(screen.queryByTestId("results-chart")).not.toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Golden hour (evening)" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "UTC offset" })).not.toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(3); // header + 2 days
    expect(rows[1]).toHaveTextContent("2026-06-2107:4617:4217:05");
    expect(screen.getByRole("button", { name: "Export CSV" })).toBeInTheDocument();
  });

  it("shows and hides the line chart with the See variation button", async () => {
    const user = userEvent.setup();
    render(<Results data={sunCycle} />);
    const toggle = screen.getByRole("button", { name: "See variation" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(screen.getByTestId("results-chart")).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveTextContent("Hide variation");

    await user.click(toggle);
    expect(screen.queryByTestId("results-chart")).not.toBeInTheDocument();
  });

  it("highlights the selected day in the table and follows Prev and Next", async () => {
    const user = userEvent.setup();
    render(<Results data={sunCycle} />);
    const rows = () => screen.getAllByRole("row");

    expect(rows()[1]).toHaveAttribute("aria-current", "true");
    expect(rows()[2]).not.toHaveAttribute("aria-current");

    await user.click(screen.getByRole("button", { name: "Next ›" }));

    expect(rows()[1]).not.toHaveAttribute("aria-current");
    expect(rows()[2]).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("img", { name: /^Sky on 2026-06-22/ })).toBeInTheDocument();
  });

  it("goes back to the first day when new results arrive", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Results data={sunCycle} />);
    await user.click(screen.getByRole("button", { name: "Next ›" }));

    rerender(<Results data={sunCycleDstChange} />);

    expect(screen.getByRole("img", { name: /^Sky on 2026-09-05/ })).toBeInTheDocument();
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
