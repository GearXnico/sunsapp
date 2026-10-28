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

  it("draws one block per stage, the sun's arc with a soft fill and the sun at solar noon", () => {
    const { container } = render(<SkyBand day={santiago} />);

    expect(container.querySelectorAll("rect.sky-night")).toHaveLength(2);
    expect(container.querySelectorAll("rect.sky-gold")).toHaveLength(2);
    expect(container.querySelectorAll("rect.sky-day")).toHaveLength(1);
    // sunrise 07:46 → x 298.9, solar noon 12:44 → x 464.4, sunset 17:42 → x 630
    expect(container.querySelector("path.sky-arc")?.getAttribute("d")).toMatch(
      /^M 298\.8\d* 118 Q 464\.4\d* -30 630 118$/,
    );
    const fill = container.querySelector("path.sky-arc-fill");
    expect(fill?.getAttribute("d")).toMatch(/ Z$/);
    expect(fill?.getAttribute("fill")).toBe(`url(#${container.querySelector("linearGradient")?.id})`);
    expect(container.querySelector("g.sky-sun")?.getAttribute("transform")).toMatch(/^translate\(464\.4\d* 44\)$/);
  });

  it("labels the hours of the day", () => {
    render(<SkyBand day={santiago} />);

    for (const time of ["00:00", "12:00", "24:00"]) {
      expect(screen.getByText(time)).toBeInTheDocument();
    }
  });

  it("keeps the hour labels outside the drawing so they stay readable when it shrinks", () => {
    render(<SkyBand day={santiago} />);

    expect(screen.getByText("12:00").closest("svg")).toBeNull();
  });

  it("draws no stages or arc when the sun does not rise", () => {
    const { container } = render(<SkyBand day={sunCyclePolarNight.days[0]!} />);

    expect(container.querySelectorAll("rect.sky-night, rect.sky-blue, rect.sky-gold, rect.sky-day")).toHaveLength(0);
    expect(container.querySelector("path.sky-arc")).toBeNull();
    expect(container.querySelector(".sky-sun")).toBeNull();
    expect(screen.getByRole("img")).toHaveAccessibleName("Sky on 2027-01-14: solar noon 12:10");
  });
});
