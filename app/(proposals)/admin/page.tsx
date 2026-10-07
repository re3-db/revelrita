import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { listProposals, storeConfigured } from "@/lib/proposal-store";
import type { Proposal } from "@/lib/proposals";
import { createProposal, logout } from "./actions";

export const metadata: Metadata = { title: "Revelrita proposals" };

const day = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric" });

function Item({ proposal: p }: { proposal: Proposal }) {
  const c = p.content;
  const what = [c.occasion, c.date, c.guests].map((s) => s.trim()).filter(Boolean).join(" · ");
  const when =
    p.status === "sent"
      ? `Sent ${day(p.sentAt ?? p.updatedAt)}${p.sentTo ? ` to ${p.sentTo}` : ""}`
      : `${p.inquiry ? "Inquiry" : "Started"} ${day(p.createdAt)}`;
  return (
    <li>
      <Link href={`/admin/${p.id}`}>
        <span>
          <span className="who">{c.name.trim() || "Untitled"}</span>
          <span className="what">{what || p.clientEmail || "No details yet"}</span>
        </span>
        <span className="when">{when}</span>
      </Link>
    </li>
  );
}

export default async function AdminPage() {
  await requireAdmin();

  let proposals: Proposal[] = [];
  let failed = false;
  if (storeConfigured()) {
    try {
      proposals = await listProposals();
    } catch (error) {
      console.error(error);
      failed = true;
    }
  }
  const drafts = proposals.filter((p) => p.status === "draft");
  const sent = proposals.filter((p) => p.status === "sent");

  return (
    <>
      <div className="bhead">
        <div className="bwrap">
          <h1>Revelrita proposals</h1>
          <p>Every inquiry from the website lands here as a draft. Nothing goes to a client until you send it.</p>
        </div>
      </div>
      <div className="bwrap">
        <div className="adminrow">
          <form action={createProposal}>
            <button type="submit" className="btn" disabled={!storeConfigured()}>
              New proposal
            </button>
          </form>
          <form action={logout}>
            <button type="submit" className="linkbtn">
              Log out
            </button>
          </form>
        </div>

        {!storeConfigured() && (
          <div className="setup">
            <h2>Connect the proposal database</h2>
            <p>
              In Vercel, open the project&apos;s <strong>Storage</strong> tab, add <strong>Upstash for Redis</strong> (the
              free plan is plenty) and connect it to this project for Production and Preview. Then redeploy.
            </p>
          </div>
        )}
        {failed && (
          <div className="setup">
            <h2>Couldn&apos;t load your proposals</h2>
            <p>The database didn&apos;t answer. Refresh in a minute.</p>
          </div>
        )}

        <fieldset>
          <legend>Drafts</legend>
          {drafts.length ? (
            <ul className="plist">
              {drafts.map((p) => (
                <Item key={p.id} proposal={p} />
              ))}
            </ul>
          ) : (
            <p className="empty">No drafts. New inquiries show up here.</p>
          )}
        </fieldset>

        <fieldset>
          <legend>Sent</legend>
          {sent.length ? (
            <ul className="plist">
              {sent.map((p) => (
                <Item key={p.id} proposal={p} />
              ))}
            </ul>
          ) : (
            <p className="empty">Nothing sent yet.</p>
          )}
        </fieldset>
      </div>
    </>
  );
}
