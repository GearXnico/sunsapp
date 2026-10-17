import Icon, { type IconName } from "./Icon";
import type { SunCycleDay } from "../api/types";

interface KeyTimesProps {
  day: SunCycleDay;
}

type Tone = "night" | "blue" | "gold" | "day";

const KEYS: [string, keyof SunCycleDay, IconName, Tone][] = [
  ["First light", "first_light", "moon", "blue"],
  ["Sunrise", "sunrise", "sunrise", "gold"],
  ["Solar noon", "solar_noon", "sun", "day"],
  ["Golden hour", "golden_hour", "camera", "gold"],
  ["Sunset", "sunset", "sunset", "gold"],
  ["Last light", "last_light", "moon", "night"],
];

// The six key moments of the day, each with its icon; a dash when the API sent none.
function KeyTimes({ day }: KeyTimesProps) {
  return (
    <ul className="keys" aria-label="Key times">
      {KEYS.map(([label, field, icon, tone]) => (
        <li key={field} className="key">
          <span className={`badge badge-${tone}`}>
            <Icon name={icon} />
          </span>
          <span>
            <small>{label}</small>
            <b>{day[field] ?? "—"}</b>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default KeyTimes;
