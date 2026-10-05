"use client";

import { useEffect, useRef, useState } from "react";
import { formatDate } from "@/lib/dates";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

/** "2027-06-14" for the given local calendar day (no time zone shifts). */
const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/**
 * The inquiry form's event date: a calendar that drops down from the field.
 * "Haven't picked a specific date yet" switches it to picking several possible
 * dates. Submits each date as a `date` field (YYYY-MM-DD), plus `flexible=yes`.
 */
export default function DatePicker({ id, placeholder }: { id: string; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [flexible, setFlexible] = useState(false);
  const [dates, setDates] = useState<string[]>([]);
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        field.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function show() {
    if (!view) {
      const start = dates[0] ? dates[0].split("-").map(Number) : null;
      const now = new Date();
      setView(start ? { y: start[0], m: start[1] - 1 } : { y: now.getFullYear(), m: now.getMonth() });
    }
    setOpen(true);
  }

  function pick(value: string) {
    if (flexible) {
      setDates((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value].sort()));
    } else {
      setDates([value]);
      setOpen(false);
      field.current?.focus();
    }
  }

  function toggleFlexible(on: boolean) {
    setFlexible(on);
    if (!on) setDates((prev) => prev.slice(0, 1));
    if (on) show();
  }

  const label = flexible
    ? dates.length
      ? `${dates.length} possible date${dates.length === 1 ? "" : "s"}`
      : ""
    : dates[0]
      ? formatDate(dates[0])
      : "";

  return (
    <div ref={root} className="relative">
      {dates.map((d) => (
        <input key={d} type="hidden" name="date" value={d} />
      ))}
      {flexible && <input type="hidden" name="flexible" value="yes" />}

      <div className="relative">
        <input
          ref={field}
          id={id}
          readOnly
          value={label}
          placeholder={flexible ? "Pick a few possible dates" : placeholder}
          role="combobox"
          aria-haspopup="dialog"
          aria-controls={`${id}-calendar`}
          aria-expanded={open}
          className="cursor-pointer pr-[48px]"
          onClick={() => (open ? setOpen(false) : show())}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
              e.preventDefault();
              show();
            }
          }}
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-1/2 right-[16px] h-[20px] w-[20px] -translate-y-1/2 fill-none stroke-ink"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      </div>

      <label className="mt-[12px] mb-0 flex cursor-pointer items-center gap-[10px] text-[14px] font-semibold">
        <input
          type="checkbox"
          className="peer absolute h-0 w-0 border-0 p-0 opacity-0"
          checked={flexible}
          onChange={(e) => toggleFlexible(e.target.checked)}
        />
        <span
          aria-hidden="true"
          className="relative h-[24px] w-[42px] shrink-0 rounded-full bg-[#E0D2B6] transition-colors peer-checked:bg-orange peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink peer-focus-visible:outline-solid after:absolute after:top-[3px] after:left-[3px] after:h-[18px] after:w-[18px] after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:after:translate-x-[18px]"
        />
        Haven&apos;t picked a specific date yet
      </label>

      {flexible && dates.length > 0 && (
        <ul className="m-0 mt-[12px] flex list-none flex-wrap gap-[8px] p-0">
          {dates.map((d) => (
            <li key={d}>
              <button
                type="button"
                className="flex cursor-pointer items-center gap-[6px] rounded-full border-0 bg-orange py-[7px] pr-[10px] pl-[14px] font-sans text-[14px] font-semibold text-white"
                onClick={() => pick(d)}
                aria-label={`Remove ${formatDate(d)}`}
              >
                {formatDate(d)}
                <span aria-hidden="true" className="text-[17px] leading-none">
                  ×
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && view && (
        <Calendar
          id={`${id}-calendar`}
          view={view}
          setView={setView}
          selected={dates}
          flexible={flexible}
          onPick={pick}
          onDone={() => {
            setOpen(false);
            field.current?.focus();
          }}
        />
      )}
    </div>
  );
}

function Calendar({
  id,
  view,
  setView,
  selected,
  flexible,
  onPick,
  onDone,
}: {
  id: string;
  view: { y: number; m: number };
  setView: (v: { y: number; m: number }) => void;
  selected: string[];
  flexible: boolean;
  onPick: (value: string) => void;
  onDone: () => void;
}) {
  const { y, m } = view;
  const now = new Date();
  const today = iso(now.getFullYear(), now.getMonth(), now.getDate());
  const atCurrentMonth = y === now.getFullYear() && m === now.getMonth();
  const firstWeekday = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const step = (delta: number) => {
    const d = new Date(y, m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  const navButton =
    "flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-full border-0 bg-cream p-0 text-ink hover:bg-[#F3E9CF] disabled:cursor-default disabled:opacity-30";

  return (
    <div
      id={id}
      role="dialog"
      aria-label={flexible ? "Pick possible dates" : "Pick a date"}
      className="absolute top-[62px] left-0 z-30 w-[312px] max-w-[calc(100vw-40px)] rounded-[18px] border-[1.5px] border-solid border-[#E0D2B6] bg-white p-[16px] shadow-[0_18px_40px_-12px_rgba(20,55,79,.35)]"
    >
      <div className="flex items-center justify-between">
        <button type="button" className={navButton} onClick={() => step(-1)} disabled={atCurrentMonth} aria-label="Previous month">
          <Chevron flip />
        </button>
        <p className="font-sans text-[16px] font-extrabold" aria-live="polite">
          {months[m]} {y}
        </p>
        <button type="button" className={navButton} onClick={() => step(1)} aria-label="Next month">
          <Chevron />
        </button>
      </div>

      {flexible && <p className="mt-[8px] text-center font-sans text-[13px] font-semibold text-muted">Tap every date that could work</p>}

      <div className="mt-[10px] grid grid-cols-7 gap-y-[4px] text-center">
        {weekdays.map((w, i) => (
          <span key={i} className="pb-[4px] font-sans text-[12px] font-bold text-muted">
            {w}
          </span>
        ))}
        {Array.from({ length: firstWeekday }, (_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const value = iso(y, m, i + 1);
          const past = value < today;
          const on = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              disabled={past}
              aria-pressed={on}
              aria-label={formatDate(value)}
              onClick={() => onPick(value)}
              className={`mx-auto flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border-0 p-0 font-sans text-[15px] font-semibold disabled:cursor-default disabled:text-[#C3CBD1] ${
                on
                  ? "bg-orange text-white"
                  : `bg-transparent text-ink hover:bg-cream ${value === today ? "shadow-[inset_0_0_0_1.5px_var(--ink)]" : ""}`
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {flexible && (
        <button type="button" className="btn sm mt-[14px] w-full" onClick={onDone}>
          Done{selected.length ? ` (${selected.length} picked)` : ""}
        </button>
      )}
    </div>
  );
}

function Chevron({ flip }: { flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-[16px] w-[16px] fill-none stroke-current ${flip ? "rotate-180" : ""}`}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
