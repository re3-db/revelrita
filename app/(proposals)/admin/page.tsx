import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { logoCream } from "@/lib/images";
import { listProposals, storeConfigured } from "@/lib/proposal-store";
import type { Proposal } from "@/lib/proposals";
import { createProposal, logout } from "./actions";

export const metadata: Metadata = { title: "Revelrita proposals" };

/** "Oct 7", in Helen's time zone */
const day = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric" });

function Row({ proposal: p }: { proposal: Proposal }) {
  const c = p.content;
  // Drafts from the form only have a first name in "Who it's for"; the form has the full one
  const formName = p.inquiry?.answers.find(([q]) => q === "Your name")?.[1];
  const name = c.name.trim() || formName?.trim() || "Untitled";
  const details = [c.occasion, c.date, c.guests].map((s) => s.trim()).filter(Boolean).join(" · ");
  const untouched = p.status === "draft" && p.inquiry && p.updatedAt === p.createdAt;
  const [pill, label] = p.status === "sent" ? ["sent", "Sent"] : untouched ? ["new", "New inquiry"] : ["draft", "Draft"];
  const when =
    p.status === "sent"
      ? `Sent ${day(p.sentAt ?? p.updatedAt)}`
      : p.updatedAt !== p.createdAt
        ? `Edited ${day(p.updatedAt)}`
        : `${p.inquiry ? "Came in" : "Started"} ${day(p.createdAt)}`;
  const email = p.status === "sent" ? p.sentTo || p.clientEmail : p.clientEmail;

  return (
    <li>
      <Link className="arow" href={`/admin/${p.id}`}>
        <span>
          <span className="arow-name">{name}</span>
          <span className="arow-meta">{details || "No event details yet"}</span>
          {email && <span className="arow-email">{email}</span>}
        </span>
        <span className="arow-side">
          <span className={`apill ${pill}`}>{label}</span>
          <span className="arow-when">{when}</span>
        </span>
        <span className="arow-go" aria-hidden="true">
          &rarr;
        </span>
      </Link>
    </li>
  );
}

function Section({ title, note, empty, proposals }: { title: string; note: string; empty: string; proposals: Proposal[] }) {
  return (
    <section className="acard">
      <div className="acard-head">
        <h2>
          {title} <span className="acount">{proposals.length}</span>
        </h2>
        <p>{note}</p>
      </div>
      {proposals.length ? (
        <ul className="alist">
          {proposals.map((p) => (
            <Row key={p.id} proposal={p} />
          ))}
        </ul>
      ) : (
        <p className="aempty">{empty}</p>
      )}
    </section>
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
  // Newest first, so the first one from the form is the latest inquiry
  const latestInquiry = proposals.find((p) => p.inquiry)?.createdAt;

  return (
    <main className="admin">
      <header className="ahero">
        <div className="ahero-top">
          <Image className="ahero-logo" src={logoCream} alt="Revelrita" preload />
          <form action={logout}>
            <button type="submit" className="alink">
              Log out
            </button>
          </form>
        </div>
        <h1 className="ahero-title">
          Your <em>proposals</em>
        </h1>
        <p className="ahero-sub">
          Every inquiry from the website lands here as a draft. Nothing goes to a client until you send it.
        </p>
        <div className="ahero-foot">
          <dl className="astats">
            <div>
              <dt>Drafts</dt>
              <dd>{drafts.length}</dd>
            </div>
            <div>
              <dt>Sent</dt>
              <dd>{sent.length}</dd>
            </div>
            <div>
              <dt>Latest inquiry</dt>
              <dd>{latestInquiry ? day(latestInquiry) : "None yet"}</dd>
            </div>
          </dl>
          <form action={createProposal}>
            <button type="submit" className="anew" disabled={!storeConfigured()}>
              New proposal
            </button>
          </form>
        </div>
      </header>

      {!storeConfigured() && (
        <div className="anote">
          <h2>Connect the proposal database</h2>
          <p>
            In Vercel, open the project&apos;s <strong>Storage</strong> tab, add <strong>Upstash for Redis</strong> (the
            free plan is plenty) and connect it to this project for Production and Preview. Then redeploy.
          </p>
        </div>
      )}
      {failed && (
        <div className="anote">
          <h2>Couldn&apos;t load your proposals</h2>
          <p>The database didn&apos;t answer. Refresh in a minute.</p>
        </div>
      )}

      <Section
        title="Drafts"
        note="Finish these and send them when they're right."
        empty="No drafts right now. New inquiries show up here."
        proposals={drafts}
      />
      <Section
        title="Sent"
        note="Edits to these show up on the client's page."
        empty="Nothing sent yet."
        proposals={sent}
      />
    </main>
  );
}
