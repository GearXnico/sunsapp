// The API sends local times as 24-hour "HH:MM". Anything else is rejected
// instead of guessed, so a format change shows up as a gap and not as a wrong point.
const TIME_PATTERN = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

// Convert "H:MM" or "HH:MM" (optionally ":SS") to minutes since midnight, or null.
export const parseTime = (value: unknown): number | null => {
  if (typeof value !== "string") return null;
  const match = TIME_PATTERN.exec(value);
  if (!match) return null;
  const [hours, minutes, seconds] = [Number(match[1]), Number(match[2]), Number(match[3] ?? 0)];
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  return hours * 60 + minutes;
};

// Convert minutes since midnight back to "HH:MM"
export const formatTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

// Convert an offset in minutes to a label such as "UTC−3", "UTC+9" or "UTC+5:30".
export const formatUtcOffset = (minutes: number): string => {
  if (minutes === 0) return "UTC";
  const sign = minutes < 0 ? "−" : "+";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? `:${m.toString().padStart(2, "0")}` : ""}`;
};
