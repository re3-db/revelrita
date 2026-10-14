import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { photos } from "@/components/proposal/ProposalView";
import PreviewBar from "@/components/proposal/PreviewBar";
import ProposalView from "@/components/proposal/ProposalView";
import ShareLinkButton from "@/components/proposal/ShareLinkButton";
import { isAdmin } from "@/lib/admin-auth";
import { siteOrigin } from "@/lib/origin";
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

// What a text or email shows when the link is pasted in (instead of whatever is at the top of the page)
const description = "What's included, the drinks and the numbers, all in one place.";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const proposal = await load((await params).id);
  if (!proposal) return { title: "Revelrita proposal" };
  const name = proposal.content.name.trim();
  const { src, alt } = photos.cart;
  return {
    title: name ? `Revelrita, ${name}` : "Revelrita proposal",
    description,
    openGraph: {
      title: name ? `A Revelrita proposal for ${name}` : "Your Revelrita proposal",
      description,
      url: `/proposal/${proposal.id}`,
      siteName: "Revelrita",
      type: "website",
      images: [{ url: src.src, width: src.width, height: src.height, alt }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const proposal = await load((await params).id);
  if (!proposal) notFound();

  // Once it's sent, Helen sees exactly what the client sees: the link is hers to pass around too.
  // A draft (which only opens for her) gets the bar, with Share link to put it live.
  const topbar = proposal.status !== "sent" ? (
    <PreviewBar
      tag="Draft"
      note="Only you can open this link until you share or send it."
      share={<ShareLinkButton id={proposal.id} link={`${await siteOrigin()}/proposal/${proposal.id}`} draft />}
      back={
        <Link href={`/admin/${proposal.id}`} className="ebtn primary">
          Back to editor
        </Link>
      }
    />
  ) : undefined;

  return (
    <ProposalView
      content={proposal.content}
      topbar={topbar}
      preload
      picks={proposal.picks?.labels}
      proposalId={proposal.id}
    />
  );
}
