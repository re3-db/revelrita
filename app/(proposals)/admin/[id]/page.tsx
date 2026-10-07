import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProposalBuilder from "@/components/proposal/ProposalBuilder";
import { requireAdmin } from "@/lib/admin-auth";
import { siteOrigin } from "@/lib/origin";
import { getProposal } from "@/lib/proposal-store";

export const metadata: Metadata = { title: "Revelrita proposal builder" };

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin(`/admin/${id}`);
  const proposal = await getProposal(id);
  if (!proposal) notFound();
  return <ProposalBuilder proposal={proposal} link={`${await siteOrigin()}/proposal/${proposal.id}`} />;
}
