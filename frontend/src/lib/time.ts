// Convert "HH:MM" to minutes since midnight
export const parseTime = (timeStr: unknown): number | null => {
  if (!timeStr || typeof timeStr !== "string") return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return Number(hours) * 60 + Number(minutes);
};

// Convert minutes since midnight back to "HH:MM"
export const formatTime = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};
