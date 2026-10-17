import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SkyBand from "./SkyBand";
import { sunCycle, sunCyclePolarNight } from "../test/fixtures";

const santiago = sunCycle.days[0]!;

describe("SkyBand", () => {
  it("is an image described by the day's times", () => {
    render(<SkyBand day={santiago} />);

    expect(screen.getByRole("img")).toHaveAccessibleName(/^Sky on 2026-06-21: first light 06:47, dawn 07:19/);
  });

  it("draws one block per stage and the sun's arc", () => {
    const { container } = render(<SkyBand day={santiago} />);

    expect(container.querySelectorAll("rect.sky-night")).toHaveLength(2);
    expect(container.querySelectorAll("rect.sky-gold")).toHaveLength(2);
    expect(container.querySelectorAll("rect.sky-day")).toHaveLength(1);
    // sunrise 07:46 → x 298.9, solar noon 12:44 → x 464.4, sunset 17:42 → x 630
    expect(container.querySelector("path.sky-arc")?.getAttribute("d")).toMatch(
      /^M 298\.8\d* 150 Q 464\.4\d* -10 630 150$/,
    );
    expect(container.querySelector("circle.sky-sun")?.getAttribute("cy")).toBe("70");
  });

  it("labels sunrise, solar noon, sunset and the golden and blue hour limits", () => {
    render(<SkyBand day={santiago} />);

    for (const time of ["07:46", "12:44", "17:42", "07:19", "08:23", "17:05", "18:09"]) {
      expect(screen.getByText(time)).toBeInTheDocument();
    }
    expect(screen.getByText("solar noon")).toBeInTheDocument();
    expect(screen.getAllByText("golden")).toHaveLength(2);
    expect(screen.getAllByText("blue")).toHaveLength(2);
  });

  it("draws no stages or arc when the sun does not rise", () => {
    const { container } = render(<SkyBand day={sunCyclePolarNight.days[0]!} />);

    expect(container.querySelectorAll("rect.sky-night, rect.sky-blue, rect.sky-gold, rect.sky-day")).toHaveLength(0);
    expect(container.querySelector("path.sky-arc")).toBeNull();
    expect(screen.getByText("12:10")).toBeInTheDocument();
    expect(screen.queryByText("sunrise")).not.toBeInTheDocument();
  });
});
