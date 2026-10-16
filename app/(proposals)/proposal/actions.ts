"use server";

import { headers } from "next/headers";
import { isAdmin } from "@/lib/admin-auth";
import { siteOrigin } from "@/lib/origin";
import { proposalEmail } from "@/lib/proposal-email";
import { getProposal, saveProposal } from "@/lib/proposal-store";
import { isEmail, money, pricedRows, type Signature } from "@/lib/proposals";
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

/** "October 17, 2026 at 3:12 PM" in Pacific time */
function signedOn(ms: number) {
  const d = new Date(ms);
  const zone = { timeZone: "America/Los_Angeles" } as const;
  return `${d.toLocaleDateString("en-US", { ...zone, month: "long", day: "numeric", year: "numeric" })} at ${d.toLocaleTimeString("en-US", { ...zone, hour: "numeric", minute: "2-digit" })}`;
}

/**
 * "Sign and book" on a client's proposal: their typed name, under the proposal's terms. Saves it
 * with a copy of what they signed (the proposal and their add-on picks as they stand), then emails
 * Helen and sends the client a copy. Anyone with the link can call it, like sendPicks, so only a
 * sent proposal with terms can be signed, and only once.
 */
export async function signProposal(
  id: string,
  input: { name: unknown; agreed: unknown },
): Promise<{ ok: boolean; message: string; signed?: { name: string; at: number } }> {
  const proposal = await getProposal(String(id));
  if (!proposal || proposal.status !== "sent") {
    return {
      ok: false,
      message: proposal && (await isAdmin()) ? "Send or share it first. A draft can't be signed." : "This proposal isn't available anymore.",
    };
  }
  if (proposal.signature) {
    const { name, at } = proposal.signature;
    return { ok: true, message: "Already signed. Thank you!", signed: { name, at } };
  }
  if (!proposal.content.terms.trim()) return { ok: false, message: "This proposal isn't ready to sign yet." };
  const name = String(input.name ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
  if (!/\p{L}.*\p{L}/u.test(name)) return { ok: false, message: "Type your full name to sign." };
  if (input.agreed !== true) return { ok: false, message: "Tick the box to agree to the terms." };

  const h = await headers();
  const signature: Signature = {
    name,
    at: Date.now(),
    ip: (h.get("x-forwarded-for") ?? "").split(",")[0].trim(),
    userAgent: (h.get("user-agent") ?? "").slice(0, 300),
    content: proposal.content,
    picks: proposal.picks?.labels ?? [],
  };
  try {
    // Read again right before saving, so add-on picks sent a moment ago aren't lost
    const latest = (await getProposal(proposal.id)) ?? proposal;
    if (latest.signature) return { ok: true, message: "Already signed. Thank you!", signed: { name: latest.signature.name, at: latest.signature.at } };
    await saveProposal({ ...latest, signature });
  } catch (error) {
    console.error(error);
    return { ok: false, message: "That didn't go through. Check your connection and try again." };
  }

  const c = proposal.content;
  const when = signedOn(signature.at);
  const service = pricedRows(c.pricing);
  const picked = pricedRows(c.addOns, "").rows.filter((r) => signature.picks.includes(r.label));
  const summary = [
    [c.occasion, c.date, c.time].map((s) => s.trim()).filter(Boolean).join(", "),
    c.venue.trim(),
    c.packageName.trim(),
    service.counted.length ? `Service total: ${money(service.total)}` : "",
    picked.length ? `Add-ons: ${picked.map((r) => (r.display ? `${r.label} (${r.display})` : r.label)).join(", ")}` : "",
    c.deposit.trim(),
  ]
    .filter(Boolean)
    .join("\n");
  const origin = await siteOrigin();
  const link = `${origin}/proposal/${proposal.id}`;

  await sendEmail({
    from: process.env.INQUIRY_NOTIFY_FROM || "Revelrita website <website@revelrita.com>",
    to: [process.env.INQUIRY_TO || "fun@revelrita.com"],
    ...(isEmail(proposal.clientEmail) ? { reply_to: proposal.clientEmail } : {}),
    subject: `${name} signed${c.date.trim() ? ` for ${c.date.trim()}` : ""}`,
    ...proposalEmail({
      message: [`${name} signed the proposal on ${when}.`, summary, "Time to send the deposit invoice!"].filter(Boolean).join("\n\n"),
      link: `${origin}/admin/${proposal.id}`,
      cta: "Open the proposal",
      note: "Signed! Hit reply to write to them.",
    }),
  });
  if (isEmail(proposal.clientEmail)) {
    await sendEmail({
      from: process.env.INQUIRY_FROM || "Revelrita <fun@revelrita.com>",
      to: [proposal.clientEmail],
      subject: `You're booked${c.date.trim() ? ` for ${c.date.trim()}` : ""}! Your signed Revelrita proposal`,
      ...proposalEmail({
        message: [
          `Hi ${c.name.trim() || "there"},`,
          `Thank you for signing! This is your copy: you signed as ${name} on ${when}.`,
          summary,
          "Your proposal, with the terms you agreed to, stays at the link below. I'll send the deposit invoice next.",
          "Cheers,\nHelen",
        ]
          .filter(Boolean)
          .join("\n\n"),
        link,
      }),
    });
  }
  return { ok: true, message: "Signed! A copy is on its way to your inbox.", signed: { name, at: signature.at } };
}
