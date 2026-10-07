import { contact } from "@/lib/site";

/**
 * The email a client gets when Helen sends their proposal from /admin: her message and a
 * button to their proposal page. Same look as the inquiry confirmation (lib/inquiry-email.ts):
 * tables + inline styles, because email clients ignore stylesheets.
 */

const logoUrl = "https://revelrita.com/email/logo.png";

const c = {
  cream: "#FFF9E9",
  paper: "#FFFDF6",
  ink: "#14374F",
  orange: "#FB5718",
  ember: "#C4400D",
  muted: "#45606F",
};
const sans = "'Bricolage Grotesque',Helvetica,Arial,sans-serif";
const serif = "'Newsreader',Georgia,'Times New Roman',serif";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function proposalEmail({ message, link }: { message: string; link: string }) {
  const paragraphs = message
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const body = paragraphs
    .map(
      (p, i) =>
        `<p style="margin:${i ? "16px" : "0"} 0 0;font-family:${serif};font-size:19px;line-height:1.6;color:${c.ink};">${escape(p).replace(/\r?\n/g, "<br>")}</p>`,
    )
    .join("\n              ");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Your Revelrita proposal</title>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,800&family=Newsreader:opsz,wght@6..72,400&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${c.cream};">
  <div style="display:none;max-height:0;overflow:hidden;">Your proposal from Revelrita is ready.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${c.cream};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <a href="https://revelrita.com" style="text-decoration:none;">
                <img src="${logoUrl}" width="240" height="60" alt="Revelrita" style="display:block;border:0;width:240px;height:auto;">
              </a>
            </td>
          </tr>
          <tr>
            <td style="background:${c.paper};border-radius:24px;border:1px solid #F1E6CC;padding:40px 36px 36px;">
              ${body}
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:30px;">
                <tr>
                  <td style="background:${c.orange};border-radius:999px;">
                    <a href="${escape(link)}" style="display:inline-block;padding:15px 30px;font-family:${sans};font-size:17px;font-weight:800;color:${c.cream};text-decoration:none;">See your proposal</a>
                  </td>
                </tr>
              </table>
              <p style="margin:18px 0 0;font-family:${sans};font-size:13px;line-height:1.6;color:${c.muted};">Or copy this link: <a href="${escape(link)}" style="color:${c.ember};word-break:break-all;">${escape(link)}</a></p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 16px 0;font-family:${sans};font-size:14px;line-height:1.7;color:${c.muted};">
              Questions? Just reply to this email.<br>
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
    paragraphs.join("\n\n"),
    "",
    `See your proposal: ${link}`,
    "",
    "----------------------------------------",
    "Questions? Just reply to this email.",
    `${contact.email} · ${contact.phone} · ${contact.instagram}`,
    "Revelrita · Mobile bar cart · Cardiff, CA",
  ].join("\n");

  return { html, text };
}
