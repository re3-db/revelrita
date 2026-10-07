/**
 * Helen's event log: a port of her "Revelrita event log" Claude artifact. Every party she
 * works, with what she charged, what she spent and who she hired. Same fields as the
 * artifact, so its events import as-is. Shared by the page (client) and the server.
 */

export type LoggedEvent = {
  id: string;
  name: string;
  /** YYYY-MM-DD */
  date: string;
  type: EventKind;
  venue: string;
  guests: number | null;
  /** Service fee, in dollars */
  fee: number | null;
  tips: number | null;
  /** Ice, garnish, mixers, cups, supplies */
  purchases: { item: string; cost: number | null }[];
  bartenders: { name: string; pay: number | null }[];
  paid: boolean;
  notes: string;
  /** ISO timestamp */
  createdAt: string;
};

export const eventKinds = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate" },
  { value: "private", label: "Private party" },
  { value: "popup", label: "Pop-up" },
  { value: "other", label: "Other" },
] as const;
export type EventKind = (typeof eventKinds)[number]["value"];

export const kindLabel = (kind: string) => eventKinds.find((k) => k.value === kind)?.label ?? "Other";

/**
 * One color per type, from the brand palette. Checked as a set: the four named types stay
 * apart from each other for color-blind eyes too; "Other" is a neutral catch-all. The light
 * ones are low-contrast on cream, so a type is always also named in text next to its color.
 */
export const kindColor: Record<EventKind, string> = {
  wedding: "#FF8B5F",
  corporate: "#2164A8",
  private: "#C4400D",
  popup: "#2CB0C9",
  other: "#857A69",
};
export const colorOf = (kind: string) => kindColor[kind as EventKind] ?? kindColor.other;

/* ---------- money ---------- */

export const num = (v: unknown) => {
  const n = parseFloat(String(v ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
export const dollars = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
/** $1.2k style, for chart labels */
export const shortDollars = (n: number) =>
  n >= 1000 ? "$" + (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k" : dollars(n);

export const revenue = (e: LoggedEvent) => num(e.fee) + num(e.tips);
export const materials = (e: LoggedEvent) => e.purchases.reduce((s, b) => s + num(b.cost), 0);
export const staffPay = (e: LoggedEvent) => e.bartenders.reduce((s, b) => s + num(b.pay), 0);

/* ---------- dates ---------- */

/** Today as YYYY-MM-DD in Helen's time zone, so "coming up" means the same on server and phone */
export const todayInCardiff = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

export const formatEventDate = (s: string) => {
  if (!s) return "No date";
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/* ---------- untrusted input (server actions, imports) ---------- */

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const amount = (v: unknown) => (v === null || v === undefined || v === "" ? null : num(v));
const list = (v: unknown) => (Array.isArray(v) ? v.slice(0, 100) : []);
const obj = (v: unknown) => (v && typeof v === "object" ? (v as Record<string, unknown>) : {});

/**
 * Coerces an event from the page (or the artifact's export) into a LoggedEvent. The artifact
 * kept older events' supplies as one `materials` / `expenses` number; those become one
 * "Materials" purchase, as the artifact showed them.
 */
export function normalizeEvent(input: unknown, id: string): LoggedEvent | null {
  const raw = obj(input);
  const name = text(raw.name, 200);
  const date = text(raw.date, 10);
  if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  let purchases = list(raw.purchases)
    .map((p) => ({ item: text(obj(p).item, 200), cost: amount(obj(p).cost) }))
    .filter((p) => p.item || p.cost !== null);
  const legacy = raw.materials ?? raw.expenses;
  if (!Array.isArray(raw.purchases) && legacy !== null && legacy !== undefined && legacy !== "") {
    purchases = [{ item: "Materials", cost: amount(legacy) }];
  }

  const kind = eventKinds.find((k) => k.value === raw.type)?.value ?? "other";
  const createdAt = text(raw.createdAt, 40);
  return {
    id,
    name,
    date,
    type: kind,
    venue: text(raw.venue, 200),
    guests: amount(raw.guests),
    fee: amount(raw.fee),
    tips: amount(raw.tips),
    purchases,
    bartenders: list(raw.bartenders)
      .map((b) => ({ name: text(obj(b).name, 120), pay: amount(obj(b).pay) }))
      .filter((b) => b.name || b.pay !== null),
    paid: raw.paid === true,
    notes: text(raw.notes, 5000),
    createdAt: Number.isNaN(Date.parse(createdAt)) ? new Date().toISOString() : createdAt,
  };
}
