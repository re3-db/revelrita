import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import AgreementView from "@/components/proposal/AgreementView";
import PreviewBar from "@/components/proposal/PreviewBar";
import { isAdmin } from "@/lib/admin-auth";
import { getProposal } from "@/lib/proposal-store";
import { FINE_PRINT } from "@/lib/proposals";

/**
 * A client's agreement, at the link Helen sends once they want to book. It opens for them once
 * she's sent it (or once they've signed); before that only Helen sees it, with the preview bar.
 */

const load = cache(async (id: string) => {
  const proposal = await getProposal(id);
  if (!proposal) return null;
  const released = proposal.status === "sent" && Boolean(proposal.agreementSentAt || proposal.signature);
  if (!released && !(await isAdmin())) return null;
  return { proposal, released };
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const found = await load((await params).id);
  const name = found?.proposal.content.name.trim();
  return {
    title: name ? `Revelrita agreement, ${name}` : "Revelrita agreement",
    description: "The final details, the numbers and the terms, ready to sign.",
  };
}

export default async function AgreementPage({ params }: { params: Promise<{ id: string }> }) {
  const found = await load((await params).id);
  if (!found) notFound();
  const { proposal: p, released } = found;
  const signed = p.signature;

  const topbar = released ? undefined : (
    <PreviewBar
      tag="Not sent yet"
      note="Only you can see this agreement until you hit Send the agreement."
      share={null}
      back={
        <Link href={`/admin/${p.id}`} className="ebtn primary">
          Back to editor
        </Link>
      }
    />
  );

  return (
    <AgreementView
      proposalId={released ? p.id : undefined}
      content={signed?.content ?? p.content}
      offered={p.content.addOns}
      picks={signed?.picks ?? p.picks?.labels ?? []}
      signed={signed && { name: signed.name, at: signed.at }}
      amendments={p.amendments ?? []}
      // The first few signatures came before the fine print, so they show none
      fineprint={signed ? (signed.fineprint ?? "") : FINE_PRINT}
      issuedAt={p.agreementSentAt}
      topbar={topbar}
    />
  );
}
