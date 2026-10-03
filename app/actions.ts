"use server";

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
 * Handles a booking inquiry (from the home page or /book form): emails the visitor
 * a branded confirmation with a copy of their answers, BCC'ing Helen, via Resend.
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
  const date = field("date");
  const { html, text } = inquiryEmail({
    name,
    answers: [
      ["Your name", name],
      ["Email", email],
      ["Event date", date],
      ["Guest count", field("guests")],
      ["What kind of event is it?", field("kind")],
      ["What are you thinking for drinks?", drinkLabels[field("drinks")] ?? ""],
      ["Where is it, and what's the vibe?", field("vibe")],
    ],
  });
  const firstName = name.split(/\s+/)[0];
  const subject = `Thanks for your inquiry${firstName ? `, ${firstName}` : ""}!${date ? ` (${date})` : ""}`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`RESEND_API_KEY is not set, so the inquiry could not be emailed:\n${text}`);
    return failed;
  }

  const from = process.env.INQUIRY_FROM || "Revelrita <fun@revelrita.com>";
  const helen = process.env.INQUIRY_BCC || "fun@revelrita.com";
  const send = (payload: Record<string, unknown>) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, subject, html, text, ...payload }),
    });

  let res = await send({ to: [email], bcc: [helen] });
  if (!res.ok) {
    // Most likely Resend refused the visitor's address. Still get the inquiry to
    // Helen (reply-to the visitor) so it isn't lost.
    console.error("Resend rejected the confirmation email:", res.status, await res.text());
    res = await send({ to: [helen], reply_to: email, subject: `[Confirmation not sent to ${email}] ${subject}` });
    if (!res.ok) {
      console.error(`Resend rejected the fallback email too: ${res.status} ${await res.text()}\n${text}`);
      return failed;
    }
  }
  return {
    ok: true,
    message: "Got it, thank you! We're on it. Check your inbox for a confirmation with a copy of your answers.",
  };
}
