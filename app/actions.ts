"use server";

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

/** Emails a booking inquiry (from the home page or /book form) to Helen via Resend. */
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
  const rows: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Event date", date],
    ["Guest count", field("guests")],
    ["Kind of event", field("kind")],
    ["Drinks", drinkLabels[field("drinks")] ?? ""],
    ["Venue and vibe", field("vibe")],
    ["Sent from", field("source")],
  ];
  const text = rows
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join("\n\n");

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set, so the inquiry could not be emailed:\n" + text);
    return failed;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.INQUIRY_FROM || "Revelrita website <onboarding@resend.dev>",
      to: [process.env.INQUIRY_TO || "fun@revelrita.com"],
      reply_to: email,
      subject: `New inquiry from ${name || email}${date ? ` for ${date}` : ""}`,
      text,
    }),
  });

  if (!res.ok) {
    console.error("Resend rejected the inquiry email:", res.status, await res.text());
    return failed;
  }
  return { ok: true, message: "Got it, thank you! We'll write back soon with availability and a few ideas." };
}
