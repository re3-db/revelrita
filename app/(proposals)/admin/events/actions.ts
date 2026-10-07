"use server";

import { isAdmin } from "@/lib/admin-auth";
import { deleteEvent, listEvents, newEventId, saveEvents, validEventId } from "@/lib/event-store";
import { normalizeEvent, type LoggedEvent } from "@/lib/events";

export type EventResult = { ok: boolean; message: string; event?: LoggedEvent; events?: LoggedEvent[] };

const loggedOut: EventResult = { ok: false, message: "You've been logged out. Log in again in a new tab, then try again." };
const offline: EventResult = { ok: false, message: "That didn't save. Check your connection and try again." };

/** Adds an event (no id) or replaces one. */
export async function saveEvent(input: unknown, id: string | null): Promise<EventResult> {
  if (!(await isAdmin())) return loggedOut;
  const event = normalizeEvent(input, id && validEventId(id) ? id : newEventId());
  if (!event) return { ok: false, message: "Add a name and a date to save this event." };
  try {
    await saveEvents([event]);
  } catch (error) {
    console.error(error);
    return offline;
  }
  return { ok: true, message: "Saved", event };
}

export async function removeEvent(id: string): Promise<EventResult> {
  if (!(await isAdmin())) return loggedOut;
  try {
    await deleteEvent(String(id));
  } catch (error) {
    console.error(error);
    return { ok: false, message: "That didn't delete. Try again." };
  }
  return { ok: true, message: "Deleted" };
}

/**
 * Brings in events from a file: the export of Helen's old event log artifact, as
 * { "events": [...] } or a bare list. Events already in the log (same id) are skipped,
 * so importing the same file twice is harmless.
 */
export async function importEvents(fileText: string): Promise<EventResult> {
  if (!(await isAdmin())) return loggedOut;
  let parsed: unknown;
  try {
    parsed = JSON.parse(String(fileText).slice(0, 5_000_000));
  } catch {
    return { ok: false, message: "That file isn't an event log export." };
  }
  const rows = Array.isArray(parsed) ? parsed : (parsed as { events?: unknown })?.events;
  if (!Array.isArray(rows)) return { ok: false, message: "That file isn't an event log export." };

  try {
    const existing = await listEvents();
    const have = new Set(existing.map((e) => e.id));
    const incoming = rows
      .slice(0, 2000)
      .map((row) => {
        const id = String((row as { id?: unknown })?.id ?? "");
        return normalizeEvent(row, validEventId(id) ? id : newEventId());
      })
      .filter((e): e is LoggedEvent => e !== null && !have.has(e.id));
    await saveEvents(incoming);
    const skipped = rows.length - incoming.length;
    return {
      ok: true,
      message: `Imported ${incoming.length} ${incoming.length === 1 ? "event" : "events"}${skipped ? ` (${skipped} already here or missing a name or date)` : ""}.`,
      events: [...existing, ...incoming],
    };
  } catch (error) {
    console.error(error);
    return offline;
  }
}
