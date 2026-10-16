import "server-only";
import { randomBytes } from "node:crypto";
import { isOldMockUp } from "@/lib/menu";
import {
  ADD_ONS_VERSION,
  migrateAddOns,
  normalizeContent,
  withAllSections,
  withCurrentWording,
  type Proposal,
} from "@/lib/proposals";
import { listJson, parseJson, pipeline } from "@/lib/redis";

export { storeConfigured } from "@/lib/redis";

/**
 * Where proposals live (see lib/redis.ts). Each proposal is one JSON value at
 * `proposal:<id>`; the `proposals` sorted set lists their ids by creation time.
 */
const key = (id: string) => `proposal:${id}`;
const INDEX = "proposals";

/**
 * Fills in fields added since a proposal was saved (like `time`), so pages can rely on every field,
 * and the standard quote, menu and price line where a proposal has none (see withAllSections).
 * Standard wording that changed gets the current version (see withCurrentWording), and a draft
 * whose menu is an untouched one from the first generator gets a themed one (sent ones keep theirs).
 * Older proposals' add-ons are brought up to Helen's current ones once (see migrateAddOns); the
 * version stamp is saved with the next save, so lines she removes after that stay removed.
 */
const complete = (p: Proposal | null): Proposal | null => {
  if (!p) return null;
  let content = withCurrentWording(normalizeContent(p.content), p.inquiry);
  if (p.status === "draft" && isOldMockUp(content.menuTitle, content.menu)) content = { ...content, menuTitle: "", menu: "" };
  if ((p.addOnsVersion ?? 1) < ADD_ONS_VERSION) content = { ...content, addOns: migrateAddOns({ ...p, content }) };
  // The copy kept with a signature gets fields added since too, but stays as it was otherwise
  const signature = p.signature && { ...p.signature, content: normalizeContent(p.signature.content) };
  return { ...p, signature, addOnsVersion: ADD_ONS_VERSION, content: withAllSections(content, p.inquiry) };
};

/** An unguessable id: the client's link is the only way to their proposal. */
export const newProposalId = () => randomBytes(12).toString("base64url");

/** Ids are always newProposalId() output, so anything else can't exist. */
const validId = (id: string) => /^[A-Za-z0-9_-]{16}$/.test(id);

export async function getProposal(id: string): Promise<Proposal | null> {
  if (!validId(id)) return null;
  const [raw] = await pipeline([["GET", key(id)]]);
  return complete(parseJson<Proposal>(raw));
}

export async function saveProposal(proposal: Proposal) {
  await pipeline([
    ["SET", key(proposal.id), JSON.stringify(proposal)],
    ["ZADD", INDEX, proposal.createdAt, proposal.id],
  ]);
}

/** Every proposal, newest first. */
export async function listProposals(): Promise<Proposal[]> {
  return (await listJson<Proposal>(INDEX, key)).map((p) => complete(p) as Proposal);
}

export async function deleteProposal(id: string) {
  if (!validId(id)) return;
  await pipeline([
    ["DEL", key(id)],
    ["ZREM", INDEX, id],
  ]);
}
