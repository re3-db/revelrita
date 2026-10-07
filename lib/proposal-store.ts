import "server-only";
import { randomBytes } from "node:crypto";
import type { Proposal } from "@/lib/proposals";

/**
 * Where proposals live: a Redis database from Upstash (Vercel > Storage > Upstash for Redis),
 * spoken to over its REST API with plain fetch, like the Resend calls (no SDK).
 * Each proposal is one JSON value at `proposal:<id>`; the `proposals` sorted set lists
 * their ids by creation time.
 */

// Vercel's Upstash integration names them KV_*; a database made on upstash.com directly, UPSTASH_*
const url = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const storeConfigured = () => Boolean(url() && token());

type Command = (string | number)[];

async function pipeline(commands: Command[]): Promise<unknown[]> {
  const base = url();
  if (!base || !token()) throw new Error("The proposal database isn't connected (KV_REST_API_URL / KV_REST_API_TOKEN).");
  const res = await fetch(`${base.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Proposal database error: ${res.status} ${await res.text()}`);
  const results = (await res.json()) as { result?: unknown; error?: string }[];
  const failed = results.find((r) => r.error);
  if (failed) throw new Error(`Proposal database error: ${failed.error}`);
  return results.map((r) => r.result);
}

const key = (id: string) => `proposal:${id}`;
const INDEX = "proposals";

function parse(raw: unknown): Proposal | null {
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as Proposal;
  } catch {
    return null;
  }
}

/** An unguessable id: the client's link is the only way to their proposal. */
export const newProposalId = () => randomBytes(12).toString("base64url");

/** Ids are always newProposalId() output, so anything else can't exist. */
const validId = (id: string) => /^[A-Za-z0-9_-]{16}$/.test(id);

export async function getProposal(id: string): Promise<Proposal | null> {
  if (!validId(id)) return null;
  const [raw] = await pipeline([["GET", key(id)]]);
  return parse(raw);
}

export async function saveProposal(proposal: Proposal) {
  await pipeline([
    ["SET", key(proposal.id), JSON.stringify(proposal)],
    ["ZADD", INDEX, proposal.createdAt, proposal.id],
  ]);
}

/** Every proposal, newest first. */
export async function listProposals(): Promise<Proposal[]> {
  const [ids] = (await pipeline([["ZRANGE", INDEX, 0, -1, "REV"]])) as [string[]];
  if (!ids.length) return [];
  const [values] = (await pipeline([["MGET", ...ids.map(key)]])) as [unknown[]];
  return values.map(parse).filter((p): p is Proposal => p !== null);
}

export async function deleteProposal(id: string) {
  if (!validId(id)) return;
  await pipeline([
    ["DEL", key(id)],
    ["ZREM", INDEX, id],
  ]);
}
