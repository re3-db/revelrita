"use server";

import { formatDate, isIsoDate } from "@/lib/dates";
import { inquiryEmail } from "@/lib/inquiry-email";

export type InquiryResult = { ok: boolean; message: string };

const drinkLabels: Record<string, string> = {
  "beer-wine": "Beer and wine",
  "beer-wine-cocktails": "Beer, wine and cocktails",
  mocktails: "Mocktails only",
  unsure: "No idea, help me decide!",
};

const failed: InquiryResult = {
  ok: false,
  message: "Something went wrong sending that. Email fun@revelrita.com and we'll get right back to you.",
};

/**
 * Handles a booking inquiry (from the home page or /book form) via Resend: emails
 * the visitor a branded confirmation with a copy of their answers, and Helen a copy.
 */
export async function sendInquiry(formData: FormData): Promise<InquiryResult> {
  const field = (key: string) => String(formData.get(key) ?? "").trim().slice(0, 5000);

  // Honeypot: real people never see or fill this field
  if (field("company")) return { ok: true, message: "" };

  const email = field("email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Add an email address so we can write back to you." };
  }

  const name = field("name");
  // The calendar sends each picked day as a YYYY-MM-DD `date`, plus `flexible=yes`
  // when the visitor is still choosing between several
  const flexible = field("flexible") === "yes";
  const dates = formData.getAll("date").map(String).filter(isIsoDate).sort().slice(0, 20).map(formatDate);
  const date = flexible ? "" : (dates[0] ?? field("date"));
  const dateAnswer = flexible
    ? dates.length
      ? `Still deciding. Possible dates:\n${dates.join("\n")}`
      : "Still deciding"
    : date;
  const answers: [string, string][] = [
    ["Your name", name],
    ["Email", email],
    ["Event date", dateAnswer],
    ["Guest count", field("guests")],
    ["What kind of event is it?", field("kind")],
    ["What are you thinking for drinks?", drinkLabels[field("drinks")] ?? ""],
    ["Where is it, and what's the vibe?", field("vibe")],
  ];
  const firstName = name.split(/\s+/)[0];
  const forDate = date ? ` for ${date}` : flexible ? " (date TBD)" : "";

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`RESEND_API_KEY is not set, so this inquiry could not be emailed:\n${JSON.stringify(answers)}`);
    return failed;
  }
  const send = async (payload: Record<string, unknown>) => {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error(`Resend rejected the email to ${payload.to}: ${res.status} ${await res.text()}`);
    return res.ok;
  };

  // The visitor's confirmation, from fun@revelrita.com
  const confirmed = await send({
    from: process.env.INQUIRY_FROM || "Revelrita <fun@revelrita.com>",
    to: [email],
    subject: `Thanks for your inquiry${firstName ? `, ${firstName}` : ""}!${date ? ` (${date})` : ""}`,
    ...inquiryEmail({ name, answers }),
  });

  // Helen's copy is a separate email from a different address: Gmail files mail
  // "from" your own address under Sent, so a BCC from fun@ never reaches her inbox.
  const notified = await send({
    from: process.env.INQUIRY_NOTIFY_FROM || "Revelrita website <website@revelrita.com>",
    to: [process.env.INQUIRY_TO || "fun@revelrita.com"],
    reply_to: email,
    subject: `${confirmed ? "" : "[Confirmation not sent] "}New inquiry from ${name || email}${forDate}`,
    ...inquiryEmail({
      name,
      answers,
      note: confirmed
        ? `New inquiry! ${email} was sent the confirmation below. Hit reply to answer them directly.`
        : `New inquiry! The confirmation could NOT be sent to ${email} (check the address for typos). Hit reply to write to them.`,
    }),
  });

  if (!notified) {
    console.error(`Helen's copy of this inquiry was not sent:\n${JSON.stringify(answers)}`);
    // The visitor has their confirmation (which Helen can find in Resend), so don't alarm them
    if (!confirmed) return failed;
  }
  const next = "We'll be in touch soon with answers to your questions and a proposal.";
  return {
    ok: true,
    message: confirmed ? `${next} A copy of your answers is on its way to ${email}.` : next,
  };
}
