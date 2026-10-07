import "server-only";

/**
 * The admin's database: Redis from Upstash (Vercel > Storage > Upstash for Redis), spoken to
 * over its REST API with plain fetch, like the Resend calls (no SDK). Proposals
 * (lib/proposal-store.ts) and the event log (lib/event-store.ts) both live here.
 */

// Vercel's Upstash integration names them KV_*; a database made on upstash.com directly, UPSTASH_*
const url = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const storeConfigured = () => Boolean(url() && token());

type Command = (string | number)[];

/** Runs commands in one round trip and returns each one's result, in order. */
export async function pipeline(commands: Command[]): Promise<unknown[]> {
  const base = url();
  if (!base || !token()) throw new Error("The database isn't connected (KV_REST_API_URL / KV_REST_API_TOKEN).");
  const res = await fetch(`${base.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Database error: ${res.status} ${await res.text()}`);
  const results = (await res.json()) as { result?: unknown; error?: string }[];
  const failed = results.find((r) => r.error);
  if (failed) throw new Error(`Database error: ${failed.error}`);
  return results.map((r) => r.result);
}

/** Every JSON value in a sorted-set index, newest first. */
export async function listJson<T>(index: string, key: (id: string) => string): Promise<T[]> {
  const [ids] = (await pipeline([["ZRANGE", index, 0, -1, "REV"]])) as [string[]];
  if (!ids.length) return [];
  const [values] = (await pipeline([["MGET", ...ids.map(key)]])) as [unknown[]];
  return values.map(parseJson<T>).filter((v): v is T => v !== null);
}

export function parseJson<T>(raw: unknown): T | null {
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
