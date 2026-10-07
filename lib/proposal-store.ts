import "server-only";
import { randomBytes } from "node:crypto";
import type { Proposal } from "@/lib/proposals";
import { listJson, parseJson, pipeline } from "@/lib/redis";

export { storeConfigured } from "@/lib/redis";

/**
 * Where proposals live (see lib/redis.ts). Each proposal is one JSON value at
 * `proposal:<id>`; the `proposals` sorted set lists their ids by creation time.
 */
const key = (id: string) => `proposal:${id}`;
const INDEX = "proposals";

/** An unguessable id: the client's link is the only way to their proposal. */
export const newProposalId = () => randomBytes(12).toString("base64url");

/** Ids are always newProposalId() output, so anything else can't exist. */
const validId = (id: string) => /^[A-Za-z0-9_-]{16}$/.test(id);

export async function getProposal(id: string): Promise<Proposal | null> {
  if (!validId(id)) return null;
  const [raw] = await pipeline([["GET", key(id)]]);
  return parseJson<Proposal>(raw);
}

export async function saveProposal(proposal: Proposal) {
  await pipeline([
    ["SET", key(proposal.id), JSON.stringify(proposal)],
    ["ZADD", INDEX, proposal.createdAt, proposal.id],
  ]);
}

/** Every proposal, newest first. */
export async function listProposals(): Promise<Proposal[]> {
  return listJson<Proposal>(INDEX, key);
}

export async function deleteProposal(id: string) {
  if (!validId(id)) return;
  await pipeline([
    ["DEL", key(id)],
    ["ZREM", INDEX, id],
  ]);
}
