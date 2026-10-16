"use server";

import { redirect } from "next/navigation";
import { checkPassword, endSession, isAdmin, requireAdmin, startSession } from "@/lib/admin-auth";
import { siteOrigin } from "@/lib/origin";
import { proposalEmail } from "@/lib/proposal-email";
import { deleteProposal, getProposal, newProposalId, saveProposal } from "@/lib/proposal-store";
import { ADD_ONS_VERSION, defaultContent, isEmail, normalizeContent, type Proposal } from "@/lib/proposals";
import { sendEmail } from "@/lib/resend";

/** What the builder needs back after a save or send */
export type SaveResult = {
  ok: boolean;
  message: string;
  proposal?: Pick<Proposal, "status" | "updatedAt" | "sentAt" | "sentTo" | "agreementSentAt">;
};

// For the builder's saves: an answer instead of a redirect, so a lapsed login can't
// navigate away from typing that hasn't saved yet
const loggedOut: SaveResult = { ok: false, message: "You've been logged out. Log in again in a new tab, then hit Save." };

/** Only same-site paths, so the login can't be used to bounce someone elsewhere */
const safeNext = (next: string) => (next.startsWith("/admin") ? next : "/admin");

export async function login(formData: FormData) {
  const next = safeNext(String(formData.get("next") ?? ""));
  if (!checkPassword(String(formData.get("password") ?? ""))) {
    // Slows down anyone guessing
    await new Promise((resolve) => setTimeout(resolve, 800));
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }
  await startSession();
  redirect(next);
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function createProposal() {
  await requireAdmin();
  const now = Date.now();
  const id = newProposalId();
  await saveProposal({
    id,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    clientEmail: "",
    content: defaultContent(),
    addOnsVersion: ADD_ONS_VERSION,
  });
  redirect(`/admin/${id}`);
}

/** Saves the builder's fields (it calls this as Helen types). */
export async function saveDraft(id: string, content: unknown, clientEmail: unknown): Promise<SaveResult> {
  if (!(await isAdmin())) return loggedOut;
  const proposal = await getProposal(String(id));
  if (!proposal) return { ok: false, message: "This proposal was deleted." };
  return store(proposal, content, clientEmail);
}

async function store(proposal: Proposal, content: unknown, clientEmail: unknown, changes: Partial<Proposal> = {}) {
  const updated: Proposal = {
    ...proposal,
    content: normalizeContent(content),
    clientEmail: String(clientEmail ?? "").trim().slice(0, 300),
    updatedAt: Date.now(),
    ...changes,
  };
  try {
    await saveProposal(updated);
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Couldn't save. Check your connection and try again." };
  }
  const { status, updatedAt, sentAt, sentTo, agreementSentAt } = updated;
  return { ok: true, message: "Saved", proposal: { status, updatedAt, sentAt, sentTo, agreementSentAt } };
}

/** Saves, then emails the client a link to their proposal and marks it sent. */
export async function sendProposal(
  id: string,
  input: { content: unknown; clientEmail: unknown; subject: unknown; message: unknown },
): Promise<SaveResult> {
  if (!(await isAdmin())) return loggedOut;
  const proposal = await getProposal(String(id));
  if (!proposal) return { ok: false, message: "This proposal was deleted." };

  const to = String(input.clientEmail ?? "").trim();
  if (!isEmail(to)) return { ok: false, message: "Add their email address first." };
  const subject = String(input.subject ?? "").trim().slice(0, 200) || "Your Revelrita proposal";
  const message = String(input.message ?? "").slice(0, 5000);

  // Save first, so the page they open is the version Helen is looking at
  const saved = await store(proposal, input.content, to);
  if (!saved.ok) return saved;

  const link = `${await siteOrigin()}/proposal/${proposal.id}`;
  const sent = await sendEmail({
    from: process.env.INQUIRY_FROM || "Revelrita <fun@revelrita.com>",
    to: [to],
    subject,
    ...proposalEmail({ message, link }),
  });
  if (!sent) return { ok: false, message: "The email didn't send. Your changes are saved, so try again in a minute." };

  // Helen's copy, its own email from website@ like her inquiry copies: a BCC from fun@ to fun@
  // never reaches her inbox. Replying to it writes to the client.
  await sendEmail({
    from: process.env.INQUIRY_NOTIFY_FROM || "Revelrita website <website@revelrita.com>",
    to: [process.env.INQUIRY_TO || "fun@revelrita.com"],
    reply_to: to,
    subject: `Sent to ${to}: ${subject}`,
    ...proposalEmail({ message, link, note: `Your proposal went to ${to}. This is your copy; hit reply to write to them.` }),
  });

  const latest = (await getProposal(proposal.id)) ?? proposal;
  const result = await store(latest, latest.content, to, { status: "sent", sentAt: Date.now(), sentTo: to });
  return result.ok ? { ...result, message: `Sent to ${to}` } : { ...result, message: `Sent to ${to}, but couldn't mark it sent.` };
}

/** For when Helen shares the link herself (text, DM): saves and marks it sent, so the link opens. */
export async function markSent(id: string, content: unknown, clientEmail: unknown): Promise<SaveResult> {
  if (!(await isAdmin())) return loggedOut;
  const proposal = await getProposal(String(id));
  if (!proposal) return { ok: false, message: "This proposal was deleted." };
  const result = await store(proposal, content, clientEmail, { status: "sent", sentAt: Date.now(), sentTo: "" });
  return result.ok ? { ...result, message: "Marked as sent. The link is live." } : result;
}

/** "Share link" on the proposal page: a draft's link only opens for Helen, so it's marked sent. */
export async function shareProposal(id: string): Promise<SaveResult> {
  if (!(await isAdmin())) return loggedOut;
  const proposal = await getProposal(String(id));
  if (!proposal) return { ok: false, message: "This proposal was deleted." };
  if (proposal.status === "sent") return { ok: true, message: "" };
  return store(proposal, proposal.content, proposal.clientEmail, { status: "sent", sentAt: Date.now(), sentTo: "" });
}

/**
 * "Send the agreement": saves, then opens the agreement page for the client (the proposal goes
 * live too, if it wasn't) and, unless Helen will share the link herself, emails it to them with
 * her copy. Needs terms, since the agreement is signed under them.
 */
export async function sendAgreement(
  id: string,
  input: { content: unknown; clientEmail: unknown; email: boolean },
): Promise<SaveResult> {
  if (!(await isAdmin())) return loggedOut;
  const proposal = await getProposal(String(id));
  if (!proposal) return { ok: false, message: "This proposal was deleted." };
  if (proposal.signature) return { ok: false, message: "They've already signed it." };
  const content = normalizeContent(input.content);
  if (!content.terms.trim()) return { ok: false, message: "Add the terms first (Use my standard terms)." };
  const to = String(input.clientEmail ?? "").trim();
  if (input.email && !isEmail(to)) return { ok: false, message: "Add their email address first." };

  const now = Date.now();
  const live: Partial<Proposal> = proposal.status === "sent" ? {} : { status: "sent", sentAt: now, sentTo: input.email ? to : "" };
  const saved = await store(proposal, content, to, { ...live, agreementSentAt: now });
  if (!saved.ok || !input.email) return saved.ok ? { ...saved, message: "The agreement is live. Copy the link below." } : saved;

  const link = `${await siteOrigin()}/proposal/${proposal.id}/agreement`;
  const name = content.name.trim() || "there";
  const subject = `Your Revelrita agreement${content.date.trim() ? ` for ${content.date.trim()}` : ""}`;
  const message = [
    `Hi ${name},`,
    "I'm so excited to make it official! Here's your agreement: the final details, the numbers and the terms, all in one place.",
    "You can add anything else you'd like (ice, custom napkins and more) right on the page before you sign. Once you sign, I'll send the deposit invoice.",
    "Cheers,\nHelen",
  ].join("\n\n");
  const sent = await sendEmail({
    from: process.env.INQUIRY_FROM || "Revelrita <fun@revelrita.com>",
    to: [to],
    subject,
    ...proposalEmail({ message, link, cta: "Review and sign" }),
  });
  if (!sent) return { ...saved, ok: false, message: "The email didn't send, but the agreement is live. Copy the link below and send it yourself." };
  await sendEmail({
    from: process.env.INQUIRY_NOTIFY_FROM || "Revelrita website <website@revelrita.com>",
    to: [process.env.INQUIRY_TO || "fun@revelrita.com"],
    reply_to: to,
    subject: `Sent to ${to}: ${subject}`,
    ...proposalEmail({ message, link, cta: "Review and sign", note: `The agreement went to ${to}. This is your copy; hit reply to write to them.` }),
  });
  return { ...saved, message: `Agreement sent to ${to}` };
}

export async function removeProposal(id: string) {
  await requireAdmin();
  await deleteProposal(String(id));
  redirect("/admin");
}
