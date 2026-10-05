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
