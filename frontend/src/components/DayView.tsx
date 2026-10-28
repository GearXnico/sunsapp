import Icon from "./Icon";
import KeyTimes from "./KeyTimes";
import SkyBand from "./SkyBand";
import type { SunCycleResponse } from "../api/types";
import { dayLength, formatDuration, formatLengthChange } from "../lib/dayView";
import "./DayView.css";

interface DayViewProps {
  data: SunCycleResponse;
  selected: number;
  onSelect: (index: number) => void;
}

// One day of the range: Prev/Next, day length, 24-hour sky band and the six key times.
function DayView({ data, selected, onSelect }: DayViewProps) {
  const { days } = data;
  const day = days[selected];
  if (!day) return null;

  const length = dayLength(day);
  const previous = days[selected - 1];
  const previousLength = previous ? dayLength(previous) : null;
  const change = length !== null && previousLength !== null ? formatLengthChange(length, previousLength) : null;

  return (
    <section className="day-view" aria-label="Day view">
      <div className="day-top">
        <div className="day-nav">
          <button
            type="button"
            className="round"
            aria-label="Previous day"
            onClick={() => onSelect(selected - 1)}
            disabled={selected === 0}
          >
            <Icon name="prev" />
          </button>
          <span className="day-date" aria-live="polite">
            <Icon name="calendar" />
            {day.date}
          </span>
          <button
            type="button"
            className="round"
            aria-label="Next day"
            onClick={() => onSelect(selected + 1)}
            disabled={selected === days.length - 1}
          >
            <Icon name="next" />
          </button>
        </div>
        <span className="pill">
          <Icon name="clock" />
          Day length <b>{length === null ? "—" : formatDuration(length)}</b>
          {change && (
            <span className="pill-change">
              {change}
              <span className="visually-hidden"> vs. previous day</span>
            </span>
          )}
        </span>
      </div>
      <SkyBand day={day} />
      <KeyTimes day={day} />
    </section>
  );
}

export default DayView;
