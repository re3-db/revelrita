import { contact } from "@/lib/site";

/**
 * The confirmation email a visitor gets after sending the inquiry form. Helen gets
 * the same email with a note on top. Email clients ignore stylesheets and most
 * modern CSS, so this is old-school tables + inline styles, using the site's palette.
 */

// Absolute, because the email is read outside the site. Lives at public/email/logo.png.
const logoUrl = "https://revelrita.com/email/logo.png";

const c = {
  cream: "#FFF9E9",
  paper: "#FFFDF6",
  ink: "#14374F",
  orange: "#FB5718",
  ember: "#C4400D",
  blush: "#FFB59A",
  muted: "#45606F",
};
const sans = "'Bricolage Grotesque',Helvetica,Arial,sans-serif";
const serif = "'Newsreader',Georgia,'Times New Roman',serif";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function inquiryEmail({
  name,
  answers,
  note,
}: {
  name: string;
  answers: [question: string, answer: string][];
  /** Shown in a banner above everything else (Helen's copy uses it). */
  note?: string;
}) {
  const firstName = name.split(/\s+/)[0] ?? "";
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";
  const thanks = "Thank you for your inquiry!";
  const body = "We're on it, and we'll be in touch soon with answers to your questions and a proposal.";
  const filled = answers.filter(([, answer]) => answer);

  const answerRows = filled
    .map(
      ([question, answer]) => `
          <tr>
            <td style="padding:14px 0;border-top:1px solid #F1E6CC;">
              <div style="font-family:${sans};font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${c.muted};">${escape(question)}</div>
              <div style="font-family:${serif};font-size:17px;line-height:1.5;color:${c.ink};padding-top:4px;">${escape(answer).replace(/\r?\n/g, "<br>")}</div>
            </td>
          </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${thanks}</title>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,800&family=Newsreader:opsz,wght@6..72,400&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${c.cream};">
  <div style="display:none;max-height:0;overflow:hidden;">${escape(body)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c.cream};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
${
            note
              ? `
          <tr>
            <td style="padding:0 0 24px;">
              <div style="background:${c.blush};border-radius:14px;padding:14px 18px;font-family:${sans};font-size:15px;line-height:1.5;font-weight:700;color:${c.ink};">${escape(note)}</div>
            </td>
          </tr>`
              : ""
          }
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <a href="https://revelrita.com" style="text-decoration:none;">
                <img src="${logoUrl}" width="240" height="60" alt="Revelrita" style="display:block;border:0;width:240px;height:auto;">
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:${c.paper};border-radius:24px;border:1px solid #F1E6CC;padding:40px 36px 28px;">
              <div style="font-family:${sans};font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${c.ember};">${escape(greeting)}</div>
              <h1 style="margin:12px 0 0;font-family:${sans};font-size:34px;line-height:1.05;font-weight:800;letter-spacing:-.02em;color:${c.ink};">${thanks}</h1>
              <p style="margin:16px 0 0;font-family:${serif};font-size:19px;line-height:1.6;color:${c.ink};">${body}</p>
              <p style="margin:12px 0 0;font-family:${serif};font-size:19px;line-height:1.6;color:${c.ink};">Cheers,<br>Helen</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
                <tr><td style="height:4px;line-height:4px;font-size:0;background:${c.orange};border-radius:4px;">&nbsp;</td></tr>
              </table>

              <div style="padding-top:28px;font-family:${sans};font-size:12px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:${c.ember};">Here's what you sent us</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">${answerRows}
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 16px 0;font-family:${sans};font-size:14px;line-height:1.7;color:${c.muted};">
              Questions in the meantime? Just reply to this email.<br>
              <a href="mailto:${contact.email}" style="color:${c.ember};font-weight:700;text-decoration:none;">${contact.email}</a>
              &nbsp;·&nbsp;
              <a href="${contact.phoneHref}" style="color:${c.ember};font-weight:700;text-decoration:none;">${contact.phone}</a>
              &nbsp;·&nbsp;
              <a href="${contact.instagramHref}" style="color:${c.ember};font-weight:700;text-decoration:none;">${contact.instagram}</a>
              <div style="padding-top:14px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">Revelrita · Mobile bar cart · Cardiff, CA</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    ...(note ? [note, "", "========================================", ""] : []),
    greeting,
    "",
    thanks,
    body,
    "",
    "Cheers,",
    "Helen",
    "",
    "----------------------------------------",
    "Here's what you sent us",
    "",
    ...filled.map(([question, answer]) => `${question}\n${answer}\n`),
    "----------------------------------------",
    "Questions in the meantime? Just reply to this email.",
    `${contact.email} · ${contact.phone} · ${contact.instagram}`,
    "Revelrita · Mobile bar cart · Cardiff, CA",
  ].join("\n");

  return { html, text };
}
