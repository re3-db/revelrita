import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Helen's login for /admin: one password (the ADMIN_PASSWORD env var). Logging in sets a
 * signed cookie that lasts 30 days. Changing ADMIN_PASSWORD logs every browser out.
 */

const COOKIE = "revelrita_admin";
const DAYS = 30;

const password = () => process.env.ADMIN_PASSWORD ?? "";
export const adminConfigured = () => password().length > 0;

const sign = (expires: number) => createHmac("sha256", password()).update(`admin:${expires}`).digest("base64url");

/** Compares without leaking how much of the guess matched */
function same(a: string, b: string) {
  const hash = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(hash(a), hash(b));
}

export function checkPassword(guess: string) {
  return adminConfigured() && same(guess, password());
}

export async function startSession() {
  const expires = Date.now() + DAYS * 24 * 60 * 60 * 1000;
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  // Reads the cookie first, even with no password set, so admin pages always render per request
  const value = (await cookies()).get(COOKIE)?.value ?? "";
  if (!adminConfigured()) return false;
  const [expires, signature] = value.split(".");
  const when = Number(expires);
  return Boolean(signature) && when > Date.now() && same(signature, sign(when));
}

/** For admin pages and actions: sends anyone else to the login page. */
export async function requireAdmin(next = "/admin") {
  if (!(await isAdmin())) redirect(`/admin/login?next=${encodeURIComponent(next)}`);
}
