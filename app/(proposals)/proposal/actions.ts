"use server";

import { isAdmin } from "@/lib/admin-auth";
import { siteOrigin } from "@/lib/origin";
import { proposalEmail } from "@/lib/proposal-email";
import { getProposal, saveProposal } from "@/lib/proposal-store";
import { isEmail, money, pricedRows } from "@/lib/proposals";
import { sendEmail } from "@/lib/resend";

/**
 * "Send my picks" on a client's proposal: saves the add-ons they ticked and emails Helen. Anyone
 * with the link can call it, like the page itself, so it only keeps add-ons the proposal offers,
 * and sending the same picks again doesn't email her twice.
 */
export async function sendPicks(id: string, labels: unknown): Promise<{ ok: boolean; message: string }> {
  const proposal = await getProposal(String(id));
  if (!proposal || (proposal.status !== "sent" && !(await isAdmin()))) {
    return { ok: false, message: "This proposal isn't available anymore." };
  }
  const wanted = Array.isArray(labels) ? labels.filter((l): l is string => typeof l === "string") : [];
  const picked = pricedRows(proposal.content.addOns, "").rows.filter((r) => wanted.includes(r.label));
  const chosen = picked.map((r) => r.label);
  const before = proposal.picks?.labels ?? [];
  if (before.length === chosen.length && before.every((l) => chosen.includes(l))) {
    return { ok: true, message: "Sent! We'll fold them into your proposal." };
  }

  try {
    await saveProposal({ ...proposal, picks: { labels: chosen, at: Date.now() } });
  } catch (error) {
    console.error(error);
    return { ok: false, message: "That didn't send. Check your connection and try again." };
  }

  const c = proposal.content;
  const name = c.name.trim() || "Your client";
  const addOnTotal = picked.reduce((sum, r) => sum + (r.num ?? 0), 0);
  const service = pricedRows(c.pricing);
  const totals = [
    addOnTotal > 0 ? `Add-ons: ${money(addOnTotal)}` : "",
    addOnTotal > 0 && service.counted.length ? `With the service total: ${money(service.total + addOnTotal)}` : "",
  ].filter(Boolean);
  const message = picked.length
    ? [
        `${name} picked ${picked.length === 1 ? "this add-on" : "these add-ons"}:`,
        picked.map((r) => (r.display ? `${r.label}: ${r.display}` : r.label)).join("\n"),
        totals.join("\n"),
      ]
        .filter(Boolean)
        .join("\n\n")
    : `${name} unticked their add-ons, so they don't want any for now.`;

  await sendEmail({
    from: process.env.INQUIRY_NOTIFY_FROM || "Revelrita website <website@revelrita.com>",
    to: [process.env.INQUIRY_TO || "fun@revelrita.com"],
    ...(isEmail(proposal.clientEmail) ? { reply_to: proposal.clientEmail } : {}),
    subject: `${name} picked add-ons${c.date.trim() ? ` for ${c.date.trim()}` : ""}`,
    ...proposalEmail({
      message,
      link: `${await siteOrigin()}/admin/${proposal.id}`,
      cta: "Open the proposal",
      note: "Add-ons picked on their proposal. They're ticked in the editor too. Hit reply to write to them.",
    }),
  });
  return { ok: true, message: "Sent! We'll fold them into your proposal." };
}
