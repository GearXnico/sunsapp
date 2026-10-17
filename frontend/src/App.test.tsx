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
    await user.type(screen.getByPlaceholderText("Location"), "Santiago");
    await user.type(screen.getByLabelText("Start Date"), "2026-06-21");
    await user.type(screen.getByLabelText("End Date"), "2026-06-22");
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Santiago" })).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByRole("img", { name: /^Sky on 2026-06-21/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "See variation" }));
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });
});
