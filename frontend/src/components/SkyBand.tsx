import { useId } from "react";
import type { SunCycleDay } from "../api/types";
import { dayStages, skyDescription } from "../lib/dayView";
import { formatTime, parseTime } from "../lib/time";

interface SkyBandProps {
  day: SunCycleDay;
}

// Drawing area: 24 hours across 800 units, band on the horizon at y = 118.
const LEFT = 40;
const WIDTH = 800;
const VIEW_WIDTH = 880;
const HORIZON = 118;
const BAND_HEIGHT = 30;
const ARC_CONTROL_Y = -30;
// Highest point of the quadratic arc: halfway between the horizon and the control point.
const SUN_Y = (HORIZON + ARC_CONTROL_Y) / 2;
const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24];
const RAYS = "M0 -20v-4M0 20v4M-20 0h-4M20 0h4M-14 -14l-3 -3M14 14l3 3M-14 14l-3 3M14 -14l3 -3";
const MOON = "M8 0A9 9 0 1 1 -2 -6a7 7 0 0 0 10 6z";

const x = (minutes: number) => LEFT + (minutes / (24 * 60)) * WIDTH;

// A 24-hour band of the day's stages with the sun's arc from sunrise to sunset, peaking at solar
// noon. The times themselves are in the aria-label and in the key cards under it.
function SkyBand({ day }: SkyBandProps) {
  const fillId = useId();
  const sunrise = parseTime(day.sunrise);
  const sunset = parseTime(day.sunset);
  const noon = parseTime(day.solar_noon);
  const arc =
    sunrise !== null && sunset !== null && noon !== null
      ? `M ${x(sunrise)} ${HORIZON} Q ${x(noon)} ${ARC_CONTROL_Y} ${x(sunset)} ${HORIZON}`
      : null;

  return (
    <div className="sky">
      <svg
        className="sky-band"
        viewBox={`0 0 ${VIEW_WIDTH} 152`}
        width="100%"
        role="img"
        aria-label={skyDescription(day)}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="sky-fill-top" />
            <stop offset="1" className="sky-fill-bottom" />
          </linearGradient>
        </defs>
        {arc && (
          <>
            <path className="sky-arc-fill" d={`${arc} Z`} fill={`url(#${fillId})`} />
            <path className="sky-arc" d={arc} />
            <g className="sky-sun" transform={`translate(${x(noon!)} ${SUN_Y})`}>
              <circle r="12" />
              <path d={RAYS} />
            </g>
          </>
        )}
        <rect className="sky-unknown" x={LEFT} y={HORIZON} width={WIDTH} height={BAND_HEIGHT} rx="6" />
        {dayStages(day).map((stage) => (
          <rect
            key={`${stage.name}-${stage.start}`}
            className={`sky-${stage.color}`}
            x={x(stage.start)}
            y={HORIZON}
            width={x(stage.end) - x(stage.start)}
            height={BAND_HEIGHT}
          />
        ))}
        <rect className="sky-frame" x={LEFT} y={HORIZON} width={WIDTH} height={BAND_HEIGHT} rx="6" />
        {[70, 810].map((moonX) => (
          <path key={moonX} className="sky-moon" transform={`translate(${moonX} 84)`} d={MOON} />
        ))}
      </svg>
      {/* HTML, not SVG text: the drawing scales down on a phone and the labels keep their size. */}
      <div className="sky-hours" aria-hidden="true">
        {HOUR_TICKS.map((hour) => (
          <span key={hour} style={{ left: `${(x(hour * 60) / VIEW_WIDTH) * 100}%` }}>
            {formatTime(hour * 60)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default SkyBand;
