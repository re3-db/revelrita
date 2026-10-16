"use server";

import { headers } from "next/headers";
import { isAdmin } from "@/lib/admin-auth";
import { addEventOnce, getEvent, saveEvents } from "@/lib/event-store";
import { amendedEvent, bookedEvent, bookedEventId } from "@/lib/events";
import { siteOrigin } from "@/lib/origin";
import { proposalEmail } from "@/lib/proposal-email";
import { getProposal, saveProposal } from "@/lib/proposal-store";
import {
  bookingTotals,
  FINE_PRINT,
  isEmail,
  money,
  pricedRows,
  type Amendment,
  type Proposal,
  type ProposalContent,
  type Signature,
} from "@/lib/proposals";
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

const notifyFrom = () => process.env.INQUIRY_NOTIFY_FROM || "Revelrita website <website@revelrita.com>";
const helen = () => [process.env.INQUIRY_TO || "fun@revelrita.com"];
const replyTo = (p: Proposal) => (isEmail(p.clientEmail) ? { reply_to: p.clientEmail } : {});
const forDate = (c: ProposalContent) => (c.date.trim() ? ` for ${c.date.trim()}` : "");
const addOnList = (rows: { label: string; display: string }[]) =>
  rows.map((r) => (r.display ? `${r.label} (${r.display})` : r.label)).join(", ");
const unavailable = { ok: false, message: "This proposal isn't available anymore." };

/** The add-on labels in `wanted` that the proposal offers */
const offered = (c: ProposalContent, wanted: unknown) => {
  const labels = Array.isArray(wanted) ? wanted.filter((l): l is string => typeof l === "string") : [];
  return pricedRows(c.addOns, "").rows.filter((r) => labels.includes(r.label)).map((r) => r.label);
};

/** What they're booking, for the emails */
function summary(c: ProposalContent, picks: string[]) {
  const t = bookingTotals(c, picks);
  return [
    [c.occasion, c.date, c.time].map((s) => s.trim()).filter(Boolean).join(", "),
    c.venue.trim(),
    c.packageName.trim(),
    t.addOns.length ? `Add-ons: ${addOnList(t.addOns)}` : "",
    t.counted ? `Total: ${money(t.total)}${t.unpriced.length ? ", plus the add-ons priced per guest or per item" : ""}` : "",
    c.deposit.trim(),
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * "We want to book!" on a client's proposal: tells Helen they're ready for the agreement. Anyone
 * with the link can call it, so it only works on a sent proposal, and only emails her once.
 */
export async function requestBooking(id: string): Promise<{ ok: boolean; message: string }> {
  const proposal = await getProposal(String(id));
  if (!proposal || proposal.status !== "sent") return unavailable;
  const done = { ok: true, message: "Yay! Helen will send your agreement to sign." };
  if (proposal.bookingRequest || proposal.agreementSentAt || proposal.signature) return done;
  try {
    await saveProposal({ ...proposal, bookingRequest: { at: Date.now() } });
  } catch (error) {
    console.error(error);
    return { ok: false, message: "That didn't send. Check your connection and try again." };
  }
  const c = proposal.content;
  const name = c.name.trim() || "Your client";
  await sendEmail({
    from: notifyFrom(),
    to: helen(),
    ...replyTo(proposal),
    subject: `${name} wants to book${forDate(c)}!`,
    ...proposalEmail({
      message: [
        `${name} tapped "We want to book!" on their proposal.`,
        summary(c, proposal.picks?.labels ?? []),
        "Finalize the details, then hit Send the agreement in the editor.",
      ].join("\n\n"),
      link: `${await siteOrigin()}/admin/${proposal.id}`,
      cta: "Open the proposal",
      note: "They want to book! Hit reply to write to them.",
    }),
  });
  return done;
}

/**
 * "Sign and book" on a client's agreement: their typed name, under its terms and fine print, with
 * the add-ons they ticked there. Saves it with a copy of what they signed, adds the party to the
 * event log, then emails Helen and sends the client a copy. Anyone with the link can call it, so
 * only an agreement Helen has sent can be signed, only once, and only with add-ons it offers.
 */
export async function signProposal(
  id: string,
  input: { name: unknown; agreed: unknown; picks: unknown },
): Promise<{ ok: boolean; message: string; signed?: { name: string; at: number } }> {
  const proposal = await getProposal(String(id));
  if (!proposal || proposal.status !== "sent" || !proposal.agreementSentAt) {
    return {
      ok: false,
      message: proposal && (await isAdmin()) ? "Send the agreement first. Only a sent one can be signed." : unavailable.message,
    };
  }
  if (proposal.signature) {
    const { name, at } = proposal.signature;
    return { ok: true, message: "Already signed. Thank you!", signed: { name, at } };
  }
  const name = String(input.name ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
  if (!/\p{L}.*\p{L}/u.test(name)) return { ok: false, message: "Type your full name to sign." };
  if (input.agreed !== true) return { ok: false, message: "Tick the box to agree to the terms." };

  const h = await headers();
  const picks = offered(proposal.content, input.picks);
  const signature: Signature = {
    name,
    at: Date.now(),
    ip: (h.get("x-forwarded-for") ?? "").split(",")[0].trim(),
    userAgent: (h.get("user-agent") ?? "").slice(0, 300),
    content: proposal.content,
    picks,
    fineprint: FINE_PRINT,
  };
  try {
    // Read again right before saving, in case it was signed a moment ago
    const latest = (await getProposal(proposal.id)) ?? proposal;
    if (latest.signature) return { ok: true, message: "Already signed. Thank you!", signed: { name: latest.signature.name, at: latest.signature.at } };
    await saveProposal({ ...latest, signature, picks: { labels: picks, at: signature.at } });
  } catch (error) {
    console.error(error);
    return { ok: false, message: "That didn't go through. Check your connection and try again." };
  }

  const origin = await siteOrigin();
  // Into Helen's event log, so her numbers stay current. Signing still counts if this fails.
  let logged = false;
  try {
    const event = bookedEvent({ ...proposal, signature }, `${origin}/admin/${proposal.id}`);
    if (event) logged = await addEventOnce(event);
  } catch (error) {
    console.error(error);
  }

  const c = proposal.content;
  const when = signedOn(signature.at);
  const booked = summary(c, picks);
  const link = `${origin}/proposal/${proposal.id}/agreement`;

  await sendEmail({
    from: notifyFrom(),
    to: helen(),
    ...replyTo(proposal),
    subject: `${name} signed${forDate(c)}`,
    ...proposalEmail({
      message: [
        `${name} signed the agreement on ${when}.`,
        booked,
        logged
          ? "It's in your event log too, with the total as the fee."
          : "It isn't in your event log: add it there by hand (the proposal's date needs a year to go in on its own).",
        "Time to send the deposit invoice!",
      ]
        .filter(Boolean)
        .join("\n\n"),
      link: `${origin}/admin/${proposal.id}`,
      cta: "Open the proposal",
      note: "Signed! Hit reply to write to them.",
    }),
  });
  if (isEmail(proposal.clientEmail)) {
    await sendEmail({
      from: process.env.INQUIRY_FROM || "Revelrita <fun@revelrita.com>",
      to: [proposal.clientEmail],
      subject: `You're booked${forDate(c)}! Your signed Revelrita agreement`,
      ...proposalEmail({
        message: [
          `Hi ${c.name.trim() || "there"},`,
          `Thank you for signing! This is your copy: you signed as ${name} on ${when}.`,
          booked,
          "Your signed agreement stays at the link below. You can add things there any time, like ice or custom napkins. I'll send the deposit invoice next.",
          "Cheers,\nHelen",
        ]
          .filter(Boolean)
          .join("\n\n"),
        link,
        cta: "See your agreement",
      }),
    });
  }
  return { ok: true, message: "Signed! A copy is on its way to your inbox.", signed: { name, at: signature.at } };
}

/**
 * "Send my changes" on a signed agreement: add-ons they're adding (among those offered and not
 * already booked) and/or a note asking for anything else. Each is kept, dated, on the proposal and
 * shown on the agreement; priced add-ons join the event log's fee; Helen gets an email and so does
 * the client, for their records.
 */
export async function amendBooking(
  id: string,
  input: { add: unknown; note: unknown },
): Promise<{ ok: boolean; message: string; amendment?: Amendment }> {
  const proposal = await getProposal(String(id));
  if (!proposal?.signature || proposal.status !== "sent") return unavailable;
  const c = proposal.content;
  const already = [...proposal.signature.picks, ...(proposal.amendments ?? []).flatMap((a) => a.add)];
  const add = offered(c, input.add).filter((l) => !already.includes(l));
  const note = String(input.note ?? "").trim().slice(0, 2000);
  if (!add.length && !note) return { ok: false, message: "Tick something to add, or tell me what you'd like to change." };
  if ((proposal.amendments ?? []).length >= 50) return { ok: false, message: "Reply to your confirmation email and I'll take it from there." };

  const amendment: Amendment = { at: Date.now(), add, note };
  try {
    const latest = (await getProposal(proposal.id)) ?? proposal;
    await saveProposal({ ...latest, amendments: [...(latest.amendments ?? []), amendment] });
  } catch (error) {
    console.error(error);
    return { ok: false, message: "That didn't send. Check your connection and try again." };
  }
  try {
    const event = await getEvent(bookedEventId(proposal.id));
    if (event) await saveEvents([amendedEvent(event, amendment, c)]);
  } catch (error) {
    console.error(error);
  }

  const name = c.name.trim() || proposal.signature.name;
  const added = bookingTotals(c, add).addOns;
  const what = [added.length ? `Adding: ${addOnList(added)}` : "", note ? `Their note: ${note}` : ""].filter(Boolean).join("\n\n");
  const origin = await siteOrigin();
  await sendEmail({
    from: notifyFrom(),
    to: helen(),
    ...replyTo(proposal),
    subject: `${name} ${added.length ? "added to" : "asked to change"} their booking${forDate(c)}`,
    ...proposalEmail({
      message: [`${name} sent a change from their signed agreement.`, what, added.length ? "It's on their agreement and in your event log." : ""]
        .filter(Boolean)
        .join("\n\n"),
      link: `${origin}/admin/${proposal.id}`,
      cta: "Open the proposal",
      note: "A change to a booking. Hit reply to write to them.",
    }),
  });
  if (isEmail(proposal.clientEmail)) {
    await sendEmail({
      from: process.env.INQUIRY_FROM || "Revelrita <fun@revelrita.com>",
      to: [proposal.clientEmail],
      subject: `Got it: your change to your Revelrita booking${forDate(c)}`,
      ...proposalEmail({
        message: [
          `Hi ${c.name.trim() || "there"},`,
          "Got it! Here's what you sent:",
          what,
          added.length ? "It's added to your agreement, and I'll put it on your invoice." : "I'll get back to you about it.",
          "Cheers,\nHelen",
        ].join("\n\n"),
        link: `${origin}/proposal/${proposal.id}/agreement`,
        cta: "See your agreement",
      }),
    });
  }
  return {
    ok: true,
    message: added.length ? "Added! It's on your agreement, and Helen has the details." : "Sent! Helen will get back to you.",
    amendment,
  };
}
