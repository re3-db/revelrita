import "server-only";
import { headers } from "next/headers";
import { siteUrl } from "@/lib/site";

/**
 * The address links in emails should point at: revelrita.com in production, otherwise
 * wherever this request came in (a Vercel preview, or localhost in dev), so links sent
 * while testing open the same deployment and database they were made on.
 */
export async function siteOrigin() {
  if (process.env.VERCEL_ENV === "production") return siteUrl;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return siteUrl;
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
