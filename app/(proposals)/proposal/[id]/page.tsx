import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import PrintButton from "@/components/proposal/PrintButton";
import ProposalView from "@/components/proposal/ProposalView";
import { isAdmin } from "@/lib/admin-auth";
import { getProposal } from "@/lib/proposal-store";

/**
 * A client's proposal, at the link Helen sends them. Drafts only open for Helen
 * (logged in), with the builder's "This is what your client sees" bar on top.
 */

const load = cache(async (id: string) => {
  const proposal = await getProposal(id);
  if (!proposal || (proposal.status !== "sent" && !(await isAdmin()))) return null;
  return proposal;
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const proposal = await load((await params).id);
  const name = proposal?.content.name.trim();
  return { title: name ? `Revelrita, ${name}` : "Revelrita proposal" };
}

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const proposal = await load((await params).id);
  if (!proposal) notFound();

  const topbar = (await isAdmin()) ? (
    <div id="editbar" className="topbar">
      <div className="wrap">
        <span>
          {proposal.status === "sent"
            ? "This is what your client sees."
            : "Draft. Only you can open this link until you send it."}
        </span>
        <span style={{ display: "flex", gap: 8 }}>
          <PrintButton />
          <Link href={`/admin/${proposal.id}`} className="topbtn">
            Back to editor
          </Link>
        </span>
      </div>
    </div>
  ) : undefined;

  return <ProposalView content={proposal.content} topbar={topbar} preload />;
}
