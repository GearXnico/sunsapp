import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { fetchSunCycle } from "./api/client";
import { sunCycle } from "./test/fixtures";

vi.mock("./api/client", () => ({ fetchSunCycle: vi.fn() }));
vi.mock("react-chartjs-2", () => ({ Line: () => <div data-testid="line-chart" /> }));

describe("App", () => {
  it("shows the results after a search", async () => {
    vi.mocked(fetchSunCycle).mockResolvedValue(sunCycle);
    const user = userEvent.setup();
    render(<App />);

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "When does the sun rise and set?" })).toBeInTheDocument();
    expect(screen.getByText("Up to 366 days.")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Location"), "Santiago");
    await user.type(screen.getByLabelText("From"), "2026-06-21");
    await user.type(screen.getByLabelText("To"), "2026-06-22");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Santiago" })).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByRole("img", { name: /^Sky on 2026-06-21/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "See variation" }));
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "When does the sun rise and set?" })).not.toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Search" })).toHaveClass("inline");
  });

  it("keeps the previous results when a new search fails", async () => {
    vi.mocked(fetchSunCycle).mockResolvedValueOnce(sunCycle).mockRejectedValueOnce(new Error("Network Error"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Location"), "Santiago");
    await user.type(screen.getByLabelText("From"), "2026-06-21");
    await user.type(screen.getByLabelText("To"), "2026-06-22");
    await user.click(screen.getByRole("button", { name: "Search" }));
    await screen.findByRole("table");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Santiago" })).toBeInTheDocument();
  });

  it("credits SunriseSunset.io and Nominatim in the footer", () => {
    render(<App />);

    expect(screen.getByRole("contentinfo")).toHaveTextContent(
      "Sun times by SunriseSunset.io · Places by Nominatim (© OpenStreetMap contributors)",
    );
    expect(screen.getByRole("link", { name: "SunriseSunset.io" })).toHaveAttribute("href", "https://sunrisesunset.io/");
    expect(screen.getByRole("link", { name: "Nominatim" })).toHaveAttribute("href", "https://nominatim.org/");
  });
});
