"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { importEvents, removeEvent, saveEvent, type EventResult } from "@/app/(proposals)/admin/events/actions";
import AdminNav from "@/components/admin/AdminNav";
import {
  colorOf,
  dollars,
  eventKinds,
  formatEventDate,
  kindLabel,
  materials,
  num,
  revenue,
  shortDollars,
  staffPay,
  type EventKind,
  type LoggedEvent,
} from "@/lib/events";
import { logoCream } from "@/lib/images";

/**
 * Helen's event log at /admin/events, ported from her "Revelrita event log" artifact: a dot
 * per party, the money (fees + tips in, supplies and bartenders out), revenue by month and
 * by type, who she hired, and every event, with the same add/edit form and CSV export.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const yearOf = (e: LoggedEvent) => e.date.slice(0, 4);

export default function EventLog({
  initialEvents,
  today,
  configured,
  failed,
}: {
  initialEvents: LoggedEvent[];
  /** YYYY-MM-DD in Cardiff, from the server so the first render matches */
  today: string;
  configured: boolean;
  failed: boolean;
}) {
  const [events, setEvents] = useState(initialEvents);
  const [year, setYear] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<LoggedEvent | "new" | null>(null);
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const say = (text: string) => setToast({ text, key: Date.now() });
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  /* ---------- the numbers, as the artifact worked them out ---------- */

  const all = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const years = [...new Set(all.map(yearOf).filter(Boolean))].sort().reverse();
  const activeYear = year !== "all" && !years.includes(year) ? "all" : year;
  const shown = all.filter((e) => activeYear === "all" || yearOf(e) === activeYear);
  const count = shown.length;
  const rev = shown.reduce((s, e) => s + revenue(e), 0);
  const mat = shown.reduce((s, e) => s + materials(e), 0);
  const pay = shown.reduce((s, e) => s + staffPay(e), 0);
  const guests = shown.reduce((s, e) => s + num(e.guests), 0);
  const unpaid = shown.filter((e) => !e.paid && revenue(e) > 0);
  const owed = unpaid.reduce((s, e) => s + revenue(e), 0);
  const upcoming = (e: LoggedEvent) => e.date >= today;

  const buckets: [string, number][] =
    activeYear === "all"
      ? (years.length ? [...years].reverse() : [today.slice(0, 4)]).map((y) => [
          y,
          all.filter((e) => yearOf(e) === y).reduce((s, e) => s + revenue(e), 0),
        ])
      : MONTHS.map((m, i) => [m, shown.filter((e) => Number(e.date.slice(5, 7)) === i + 1).reduce((s, e) => s + revenue(e), 0)]);
  const peak = Math.max(0, ...buckets.map((b) => b[1]));

  const byKind = eventKinds
    .map((k) => {
      const es = shown.filter((e) => e.type === k.value);
      return { ...k, n: es.length, r: es.reduce((s, e) => s + revenue(e), 0) };
    })
    .filter((k) => k.n);
  const kindPeak = Math.max(1, ...byKind.map((k) => k.r));

  const staff = new Map<string, { name: string; n: number; p: number }>();
  for (const e of shown) {
    for (const b of e.bartenders) {
      const name = b.name.trim() || "Unnamed";
      const row = staff.get(name.toLowerCase()) ?? { name, n: 0, p: 0 };
      row.n++;
      row.p += num(b.pay);
      staff.set(name.toLowerCase(), row);
    }
  }
  const staffRows = [...staff.values()].sort((a, b) => b.p - a.p);

  const q = query.trim().toLowerCase();
  const matches = shown.filter(
    (e) =>
      !q ||
      [e.name, e.venue, e.notes, ...e.bartenders.map((b) => b.name)].some((s) => s.toLowerCase().includes(q)),
  );
  const comingUp = matches.filter(upcoming);
  const done = matches.filter((e) => !upcoming(e)).reverse();
  const usedKinds = eventKinds.filter((k) => shown.some((e) => e.type === k.value));

  /* ---------- actions ---------- */

  function exportCsv() {
    const cell = (v: unknown) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const cols = ["date", "name", "type", "venue", "guests", "fee", "tips", "materials", "purchases", "bartenders", "bartender_pay", "kept", "paid", "notes"];
    const rows = all.map((e) =>
      [
        e.date,
        e.name,
        kindLabel(e.type),
        e.venue,
        e.guests ?? "",
        e.fee ?? "",
        e.tips ?? "",
        materials(e),
        e.purchases.map((b) => (b.item || "Item") + (b.cost !== null ? ` ($${num(b.cost)})` : "")).join("; "),
        e.bartenders.map((b) => b.name + (b.pay !== null ? ` ($${num(b.pay)})` : "")).join("; "),
        staffPay(e),
        revenue(e) - materials(e) - staffPay(e),
        e.paid ? "yes" : "no",
        e.notes,
      ]
        .map(cell)
        .join(","),
    );
    const blob = new Blob([[cols.join(","), ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "revelrita-events.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function importFile(file: File | undefined) {
    if (!file) return;
    setImporting(true);
    let result: EventResult;
    try {
      result = await importEvents(await file.text());
    } catch {
      result = { ok: false, message: "That didn't import. Check your connection and try again." };
    }
    setImporting(false);
    if (fileInput.current) fileInput.current.value = "";
    if (result.events) setEvents(result.events);
    say(result.message);
  }

  return (
    <main className="admin ed evlog">
      <header className="ahero">
        <div className="ahero-top">
          <Image className="ahero-logo" src={logoCream} alt="Revelrita" preload />
          <AdminNav current="events" />
        </div>
        <h1 className="ahero-title">
          {count ? (
            <>
              {count} {count === 1 ? "event" : "events"}, <em>{dollars(rev)}</em> made.
            </>
          ) : events.length ? (
            "No events here yet."
          ) : (
            <>
              Every party, <em>counted.</em>
            </>
          )}
        </h1>
        <div className="ahero-foot">
          <div className="evyears" role="group" aria-label="Show a year">
            {years.length > 0 &&
              ["all", ...years].map((y) => (
                <button key={y} type="button" aria-pressed={y === activeYear} onClick={() => setYear(y)}>
                  {y === "all" ? "All time" : y}
                </button>
              ))}
          </div>
          <div className="evactions">
            {events.length > 0 && (
              <button type="button" className="alink" onClick={exportCsv}>
                Export CSV
              </button>
            )}
            <button type="button" className="anew" onClick={() => setEditing("new")} disabled={!configured}>
              Add event
            </button>
          </div>
        </div>
      </header>

      {!configured && (
        <div className="anote">
          <h2>Connect the database</h2>
          <p>The event log uses the same Upstash database as your proposals. Connect it in Vercel, then redeploy.</p>
        </div>
      )}
      {failed && (
        <div className="anote">
          <h2>Couldn&apos;t load your events</h2>
          <p>The database didn&apos;t answer. Refresh in a minute.</p>
        </div>
      )}
      {configured && !failed && events.length === 0 && (
        <div className="anote evimport">
          <h2>Bring over your event log</h2>
          <p>Have the export file from your old event log? Add it here and every event comes across.</p>
          <button type="button" className="ebtn dark" disabled={importing} onClick={() => fileInput.current?.click()}>
            {importing ? "Importing..." : "Choose the file"}
          </button>
        </div>
      )}
      <input
        ref={fileInput}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(e) => importFile(e.target.files?.[0])}
      />

      <section className="acard" aria-label="One dot per event">
        <div className="evtally">
          {count ? (
            shown.map((e) => (
              <button
                key={e.id}
                type="button"
                className={`evdot${upcoming(e) ? " upcoming" : ""}`}
                style={{ "--c": colorOf(e.type) } as CSSProperties}
                title={`${e.name} · ${formatEventDate(e.date)}`}
                aria-label={`${e.name}, ${formatEventDate(e.date)}${upcoming(e) ? ", coming up" : ""}`}
                onClick={() => setEditing(e)}
              />
            ))
          ) : (
            <p className="aempty">Each event you add drops a dot here. Tap Add event to start the tally.</p>
          )}
        </div>
        {count > 0 && (
          <div className="evlegend">
            {usedKinds.map((k) => (
              <span key={k.value}>
                <i style={{ background: colorOf(k.value) }} />
                {k.label}
              </span>
            ))}
            {shown.some(upcoming) && (
              <span>
                <i className="hollow" />
                Coming up
              </span>
            )}
          </div>
        )}
      </section>

      <section className="acard evstats" aria-label="Totals">
        <dl>
          {(
            [
              [dollars(rev), "Revenue (fees + tips)"],
              [dollars(mat), "Materials & supplies"],
              [dollars(pay), "Bartender pay"],
              [dollars(rev - mat - pay), "You kept"],
              [count ? dollars(rev / count) : "$0", "Avg per event"],
              [guests.toLocaleString(), "Guests served"],
            ] as const
          ).map(([value, label]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        {owed > 0 && (
          <p className="evowed">
            Waiting on {dollars(owed)} from {unpaid.length} {unpaid.length === 1 ? "event" : "events"}.
          </p>
        )}
      </section>

      <div className="evgrid">
        <section className="acard">
          <div className="acard-head">
            <h2>{activeYear === "all" ? "Revenue by year" : `Revenue by month, ${activeYear}`}</h2>
          </div>
          <div className="evbars">
            {buckets.map(([label, value]) => (
              <button
                key={label}
                type="button"
                className="evbar"
                aria-label={`${label}: ${dollars(value)}`}
                tabIndex={value ? 0 : -1}
                style={{ "--h": value ? Math.max(3, (value / peak) * 100) : 0 } as CSSProperties}
              >
                <span className="evbar-plot">
                  <span
                    className={`evbar-col${value ? "" : " zero"}`}
                    style={{ height: value ? `${Math.max(3, (value / peak) * 100)}%` : "2px" }}
                  />
                </span>
                <span className="evbar-lab">{label}</span>
                {value === peak && value > 0 && <span className="evbar-val">{shortDollars(value)}</span>}
                {value > 0 && (
                  <span className="evbar-tip" role="presentation">
                    <strong>{dollars(value)}</strong> {label}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
        <section className="acard">
          <div className="acard-head">
            <h2>By event type</h2>
          </div>
          {byKind.length ? (
            <div className="evkinds">
              {byKind.map((k) => (
                <div className="evkind" key={k.value}>
                  <span>
                    <i style={{ background: colorOf(k.value) }} />
                    {k.label}
                  </span>
                  <span className="meta">
                    {k.n} · {dollars(k.r)}
                  </span>
                  <span className="track">
                    <span style={{ width: `${Math.max(3, (k.r / kindPeak) * 100)}%`, background: colorOf(k.value) }} />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="aempty">Your mix of weddings, corporate and parties shows up here.</p>
          )}
        </section>
      </div>

      {staffRows.length > 0 && (
        <section className="acard">
          <div className="acard-head">
            <h2>Bartenders</h2>
          </div>
          <div className="evtable">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="n">Events</th>
                  <th className="n">Paid</th>
                </tr>
              </thead>
              <tbody>
                {staffRows.map((s) => (
                  <tr key={s.name}>
                    <td>{s.name}</td>
                    <td className="n">{s.n}</td>
                    <td className="n">{dollars(s.p)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="acard">
        <div className="acard-head evlisthead">
          <h2>All events</h2>
          <input
            type="search"
            className="evsearch"
            placeholder="Search name, venue or bartender"
            aria-label="Search events"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {comingUp.length > 0 && <Group title="Coming up" events={comingUp} onOpen={setEditing} />}
        {done.length > 0 && <Group title="Done" events={done} onOpen={setEditing} />}
        {!comingUp.length && !done.length && (
          <p className="aempty">{events.length ? "Nothing matches that." : "No events yet."}</p>
        )}
      </section>

      {configured && events.length > 0 && (
        <p className="edelete">
          <button type="button" className="elink" disabled={importing} onClick={() => fileInput.current?.click()}>
            {importing ? "Importing..." : "Import events from a file"}
          </button>
        </p>
      )}

      {editing && (
        <EventDialog
          event={editing === "new" ? null : editing}
          events={events}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setEvents((list) => [...list.filter((e) => e.id !== saved.id), saved]);
            setEditing(null);
            say("Saved");
          }}
          onDeleted={(id) => {
            setEvents((list) => list.filter((e) => e.id !== id));
            setEditing(null);
            say("Deleted");
          }}
        />
      )}

      {toast && (
        <div className="toast" key={toast.key} role="status">
          {toast.text}
        </div>
      )}
    </main>
  );
}


function Group({
  title,
  events,
  onOpen,
}: {
  title: string;
  events: LoggedEvent[];
  onOpen: (e: LoggedEvent) => void;
}) {
  return (
    <>
      <p className="evgroup">{title}</p>
      <ul className="alist">
        {events.map((e) => {
          const r = revenue(e);
          const sub = [
            kindLabel(e.type),
            e.venue,
            num(e.guests) ? `${num(e.guests)} guests` : "",
            e.bartenders.length ? `with ${e.bartenders.map((b) => b.name || "a bartender").join(" & ")}` : "",
          ]
            .filter(Boolean)
            .join(", ");
          return (
            <li key={e.id}>
              <button type="button" className="evrow" onClick={() => onOpen(e)}>
                <span className="evrow-date">{formatEventDate(e.date)}</span>
                <span className="evrow-main">
                  <span className="evrow-name">
                    <i style={{ background: colorOf(e.type) }} />
                    {e.name}
                  </span>
                  <span className="evrow-sub">{sub}</span>
                </span>
                <span className="evrow-amt">
                  {dollars(r)}
                  {r > 0 && <span className={`apill ${e.paid ? "sent" : "new"}`}>{e.paid ? "Paid" : "Unpaid"}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/* ---------- add / edit ---------- */

type Line = { a: string; b: string };
const str = (v: number | null) => (v === null ? "" : String(v));

function EventDialog({
  event,
  events,
  onClose,
  onSaved,
  onDeleted,
}: {
  event: LoggedEvent | null;
  events: LoggedEvent[];
  onClose: () => void;
  onSaved: (e: LoggedEvent) => void;
  onDeleted: (id: string) => void;
}) {
  const [f, setF] = useState({
    name: event?.name ?? "",
    date: event?.date ?? "",
    type: (event?.type ?? "wedding") as EventKind,
    venue: event?.venue ?? "",
    guests: str(event?.guests ?? null),
    fee: str(event?.fee ?? null),
    tips: str(event?.tips ?? null),
    paid: event?.paid ?? false,
    notes: event?.notes ?? "",
  });
  const [buys, setBuys] = useState<Line[]>(event?.purchases.map((p) => ({ a: p.item, b: str(p.cost) })) ?? []);
  const [crew, setCrew] = useState<Line[]>(event?.bartenders.map((p) => ({ a: p.name, b: str(p.pay) })) ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const itemNames = [...new Set(events.flatMap((e) => e.purchases.map((p) => p.item.trim())).filter(Boolean))].sort();
  const staffNames = [...new Set(events.flatMap((e) => e.bartenders.map((b) => b.name.trim())).filter(Boolean))].sort();
  const set = (patch: Partial<typeof f>) => setF((v) => ({ ...v, ...patch }));

  async function save() {
    if (!f.name.trim() || !f.date) return setError("Add a name and a date to save this event.");
    setBusy(true);
    setError("");
    const data = {
      ...f,
      purchases: buys.map((l) => ({ item: l.a, cost: l.b })),
      bartenders: crew.map((l) => ({ name: l.a, pay: l.b })),
      createdAt: event?.createdAt,
    };
    let result: EventResult;
    try {
      result = await saveEvent(data, event?.id ?? null);
    } catch {
      result = { ok: false, message: "That didn't save. Check your connection and try again." };
    }
    setBusy(false);
    if (result.ok && result.event) onSaved(result.event);
    else setError(result.message);
  }

  async function remove() {
    if (!event || !window.confirm(`Delete "${event.name}"? This can't be undone.`)) return;
    setBusy(true);
    let result: EventResult;
    try {
      result = await removeEvent(event.id);
    } catch {
      result = { ok: false, message: "That didn't delete. Try again." };
    }
    setBusy(false);
    if (result.ok) onDeleted(event.id);
    else setError(result.message);
  }

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <form
        className="sendbox evdlg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evTitle"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <h2 id="evTitle">{event ? "Edit event" : "Add event"}</h2>
        <Field label="Event name" htmlFor="ev_name">
          <input id="ev_name" value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Garcia wedding" autoComplete="off" autoFocus />
        </Field>
        <div className="egrid">
          <Field label="Date" htmlFor="ev_date">
            <input id="ev_date" type="date" value={f.date} onChange={(e) => set({ date: e.target.value })} />
          </Field>
          <Field label="Venue" htmlFor="ev_venue">
            <input id="ev_venue" value={f.venue} onChange={(e) => set({ venue: e.target.value })} autoComplete="off" />
          </Field>
        </div>
        <div className="estack">
          <span className="elabel" id="evTypeLabel">
            Type
          </span>
          <div className="eseg" role="radiogroup" aria-labelledby="evTypeLabel">
            {eventKinds.map((k) => (
              <label key={k.value} className={f.type === k.value ? "on" : undefined}>
                <input type="radio" name="evType" value={k.value} checked={f.type === k.value} onChange={() => set({ type: k.value })} />
                {k.label}
              </label>
            ))}
          </div>
        </div>
        <div className="egrid evthree">
          <Field label="Guests" htmlFor="ev_guests">
            <input id="ev_guests" type="number" inputMode="numeric" min="0" value={f.guests} onChange={(e) => set({ guests: e.target.value })} />
          </Field>
          <Field label="Service fee ($)" htmlFor="ev_fee">
            <input id="ev_fee" type="number" inputMode="decimal" min="0" step="any" value={f.fee} onChange={(e) => set({ fee: e.target.value })} />
          </Field>
          <Field label="Tips ($)" htmlFor="ev_tips">
            <input id="ev_tips" type="number" inputMode="decimal" min="0" step="any" value={f.tips} onChange={(e) => set({ tips: e.target.value })} />
          </Field>
        </div>

        <Lines
          title="What you bought"
          hint="Ice, garnish, mixers, cups, supplies"
          lines={buys}
          setLines={setBuys}
          nameLabel="What was it?"
          amountLabel="Cost $"
          suggestions={itemNames}
          listId="evItems"
          add="+ Add item"
          empty="Nothing added yet."
          total
        />
        <Lines
          title="Bartenders you hired"
          lines={crew}
          setLines={setCrew}
          nameLabel="Bartender name"
          amountLabel="Paid $"
          suggestions={staffNames}
          listId="evStaff"
          add="+ Add bartender"
          empty="None hired, you worked this one yourself."
        />

        <label className="evcheck">
          <input type="checkbox" checked={f.paid} onChange={(e) => set({ paid: e.target.checked })} /> Paid in full
        </label>
        <Field label="Notes" htmlFor="ev_notes">
          <textarea id="ev_notes" rows={3} value={f.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Menu, vibe, anything worth remembering" />
        </Field>

        {error && <p className="everr">{error}</p>}
        <div className="esend-actions evdlg-actions">
          {event && (
            <button type="button" className="elink danger" onClick={remove} disabled={busy}>
              Delete
            </button>
          )}
          <span className="ebar-space" />
          <button type="button" className="ebtn ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="ebtn primary" disabled={busy}>
            {busy ? "Saving..." : "Save event"}
          </button>
        </div>
      </form>
    </div>
  );
}

/** A list of name + amount lines: purchases, or bartenders and what they were paid */
function Lines({
  title,
  hint,
  lines,
  setLines,
  nameLabel,
  amountLabel,
  suggestions,
  listId,
  add,
  empty,
  total,
}: {
  title: string;
  hint?: string;
  lines: Line[];
  setLines: (lines: Line[]) => void;
  nameLabel: string;
  amountLabel: string;
  suggestions: string[];
  listId: string;
  add: string;
  empty: string;
  total?: boolean;
}) {
  const edit = (i: number, patch: Partial<Line>) => setLines(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  return (
    <div className="estack evlines">
      <span className="elabel">
        {title} {hint && <small>{hint}</small>}
      </span>
      {lines.length ? (
        lines.map((l, i) => (
          <div className="evline" key={i}>
            <input list={listId} placeholder={nameLabel} aria-label={nameLabel} value={l.a} onChange={(e) => edit(i, { a: e.target.value })} />
            <input type="number" inputMode="decimal" min="0" step="any" placeholder={amountLabel} aria-label={amountLabel} value={l.b} onChange={(e) => edit(i, { b: e.target.value })} />
            <button type="button" className="pr-x" aria-label="Remove" onClick={() => setLines(lines.filter((_, j) => j !== i))}>
              &times;
            </button>
          </div>
        ))
      ) : (
        <p className="ehint">{empty}</p>
      )}
      <datalist id={listId}>
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <div className="eprice-foot">
        <button type="button" className="elink" onClick={() => setLines([...lines, { a: "", b: "" }])}>
          {add}
        </button>
        {total && lines.length > 0 && (
          <span className="eprice-total">
            Total <strong>{dollars(lines.reduce((s, l) => s + num(l.b), 0))}</strong>
          </span>
        )}
      </div>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="estack">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  );
}
