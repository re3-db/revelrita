import "server-only";
import { randomBytes } from "node:crypto";
import type { LoggedEvent } from "@/lib/events";
import { listJson, pipeline } from "@/lib/redis";

/**
 * Where the event log lives (see lib/redis.ts). Each event is one JSON value at
 * `event:<id>`; the `events` sorted set lists their ids.
 */
const key = (id: string) => `event:${id}`;
const INDEX = "events";

export const newEventId = () => randomBytes(9).toString("base64url");

/** Our ids, and the artifact's (like "e22-50th-birthday") for imported events */
export const validEventId = (id: string) => /^[A-Za-z0-9_-]{1,80}$/.test(id);

export async function listEvents(): Promise<LoggedEvent[]> {
  return listJson<LoggedEvent>(INDEX, key);
}

export async function saveEvents(events: LoggedEvent[]) {
  if (!events.length) return;
  await pipeline(
    events.flatMap((e) => [
      ["SET", key(e.id), JSON.stringify(e)],
      ["ZADD", INDEX, Date.parse(e.createdAt) || Date.now(), e.id],
    ]),
  );
}

export async function deleteEvent(id: string) {
  if (!validEventId(id)) return;
  await pipeline([
    ["DEL", key(id)],
    ["ZREM", INDEX, id],
  ]);
}
