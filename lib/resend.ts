import "server-only";

/** Sends one email through the Resend REST API. Logs and returns false if Resend refuses it. */
export async function sendEmail(payload: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`RESEND_API_KEY is not set, so the email to ${payload.to} was not sent`);
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) console.error(`Resend rejected the email to ${payload.to}: ${res.status} ${await res.text()}`);
  return res.ok;
}
