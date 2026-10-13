/** "Sat, Jun 14, 2027" for a YYYY-MM-DD date, without time zone shifts. */
export function formatDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

/** HH:MM, what a time input sends (some browsers add seconds: HH:MM:SS or HH:MM:SS.sss) */
export const isClockTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d(\.\d+)?)?$/.test(value);

const clock = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  return { text: `${h % 12 || 12}:${String(m).padStart(2, "0")}`, half: h < 12 ? "AM" : "PM", minutes: h * 60 + m };
};

/** "5:00 to 9:00 PM", "11:30 AM to 3:00 PM", "Starts 5:00 PM", or "" for the form's two time inputs. */
export function timeRange(start: string, end: string) {
  const s = isClockTime(start) ? clock(start) : null;
  const e = isClockTime(end) ? clock(end) : null;
  if (s && e) return s.half === e.half ? `${s.text} to ${e.text} ${e.half}` : `${s.text} ${s.half} to ${e.text} ${e.half}`;
  if (s) return `Starts ${s.text} ${s.half}`;
  if (e) return `Until ${e.text} ${e.half}`;
  return "";
}

/** "4 hours" or "4.5 hours" between two HH:MM times (past midnight counts as the next day), or "" */
export function hoursBetween(start: string, end: string) {
  if (!isClockTime(start) || !isClockTime(end)) return "";
  const minutes = (clock(end).minutes - clock(start).minutes + 24 * 60) % (24 * 60);
  if (!minutes) return "";
  const hours = Math.round((minutes / 60) * 4) / 4;
  return `${hours} ${hours === 1 ? "hour" : "hours"}`;
}
