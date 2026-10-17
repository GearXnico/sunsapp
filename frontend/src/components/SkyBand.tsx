import type { SunCycleDay } from "../api/types";
import { dayStages, morningGoldenEnd, skyDescription } from "../lib/dayView";
import { formatTime, parseTime } from "../lib/time";

interface SkyBandProps {
  day: SunCycleDay;
}

// Drawing area: 24 hours across 800 units, band on the horizon at y = 150.
const LEFT = 40;
const WIDTH = 800;
const HORIZON = 150;
const BAND_HEIGHT = 34;
const ARC_CONTROL_Y = -10;
// Highest point of the quadratic arc: halfway between the horizon and the control point.
const SUN_Y = (HORIZON + ARC_CONTROL_Y) / 2;
const HOUR_TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24];

const x = (minutes: number) => LEFT + (minutes / (24 * 60)) * WIDTH;

// A 24-hour band of the day's stages with the sun's arc from sunrise to sunset, peaking at solar noon.
function SkyBand({ day }: SkyBandProps) {
  const sunrise = parseTime(day.sunrise);
  const sunset = parseTime(day.sunset);
  const noon = parseTime(day.solar_noon);
  const above: [string, number | null, number][] = [
    ["sunrise", sunrise, 120],
    ["solar noon", noon, 46],
    ["sunset", sunset, 120],
  ];
  const below: [string, number | null, "start" | "end"][] = [
    ["blue", parseTime(day.dawn), "end"],
    ["golden", morningGoldenEnd(day), "start"],
    ["golden", parseTime(day.golden_hour), "end"],
    ["blue", parseTime(day.dusk), "start"],
  ];

  return (
    <svg className="sky-band" viewBox="0 0 880 250" width="100%" role="img" aria-label={skyDescription(day)}>
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
      {HOUR_TICKS.map((hour) => (
        <g key={hour} className="sky-muted">
          <line x1={x(hour * 60)} y1="184" x2={x(hour * 60)} y2="190" />
          <text x={x(hour * 60)} y="204" fontSize="11" textAnchor="middle">
            {formatTime(hour * 60)}
          </text>
        </g>
      ))}
      <line className="sky-horizon" x1={LEFT} y1={HORIZON} x2={LEFT + WIDTH} y2={HORIZON} />
      <text className="sky-muted" x={LEFT + 4} y={HORIZON - 6} fontSize="11">
        horizon
      </text>
      {sunrise !== null && sunset !== null && noon !== null && (
        <>
          <path
            className="sky-arc"
            d={`M ${x(sunrise)} ${HORIZON} Q ${x(noon)} ${ARC_CONTROL_Y} ${x(sunset)} ${HORIZON}`}
          />
          <circle className="sky-sun" cx={x(noon)} cy={SUN_Y} r="11" />
        </>
      )}
      {above.map(([label, minutes, y]) =>
        minutes === null ? null : (
          <g key={label} textAnchor="middle">
            <text className="sky-strong" x={x(minutes)} y={y} fontSize="12">
              {formatTime(minutes)}
            </text>
            <text className="sky-muted" x={x(minutes)} y={y + 14} fontSize="11">
              {label}
            </text>
          </g>
        ),
      )}
      {below.map(([label, minutes, anchor]) => {
        if (minutes === null) return null;
        const textX = x(minutes) + (anchor === "end" ? -3 : 3);
        return (
          <g key={`${label}-${anchor}`} textAnchor={anchor}>
            <line className="sky-guide" x1={x(minutes)} y1="190" x2={x(minutes)} y2="214" />
            <text className="sky-strong" x={textX} y="228" fontSize="11">
              {formatTime(minutes)}
            </text>
            <text className="sky-muted" x={textX} y="242" fontSize="10">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default SkyBand;
