import type { Stage } from "../lib/dayView";
import { formatTime } from "../lib/time";

interface StageListProps {
  stages: Stage[];
}

// The day's stages with their start and end times; the nights at both ends are left out.
function StageList({ stages }: StageListProps) {
  const shown = stages.filter((stage) => stage.color !== "night");

  if (shown.length === 0) {
    return <p className="day-muted">No twilight or daylight stages on this day (polar day or night).</p>;
  }

  return (
    <ul className="stage-list">
      {shown.map((stage) => (
        <li key={`${stage.name}-${stage.start}`} className="stage">
          <span className={`stage-swatch sky-${stage.color}`} aria-hidden="true" />
          <span>{stage.name}</span>
          <span className="stage-time">
            {formatTime(stage.start)}–{formatTime(stage.end)}
          </span>
          {stage.note && <small>{stage.note}</small>}
        </li>
      ))}
    </ul>
  );
}

export default StageList;
