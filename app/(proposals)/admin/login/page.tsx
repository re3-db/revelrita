import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
import { logoCream } from "@/lib/images";
import { login } from "../actions";

export const metadata: Metadata = { title: "Log in | Revelrita proposals" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" && params.next.startsWith("/admin") ? params.next : "/admin";
  if (await isAdmin()) redirect(next);

  return (
    <main className="alogin">
      <div className="alogin-card">
        <Image className="ahero-logo" src={logoCream} alt="Revelrita" preload />
        <h1>
          Your <em>proposals</em>
        </h1>
        {adminConfigured() ? (
          <form action={login}>
            <p className="alogin-sub">Log in to see your drafts and send proposals.</p>
            <input type="hidden" name="next" value={next} />
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
            {params.error && <p className="alogin-error">That&apos;s not it. Try again.</p>}
            <button type="submit" className="anew">
              Log in
            </button>
          </form>
        ) : (
          <p className="alogin-sub">
            Almost there: set an <strong>ADMIN_PASSWORD</strong> in Vercel (Project, Settings, Environment Variables),
            then redeploy. That password is what you&apos;ll log in with here.
          </p>
        )}
      </div>
    </main>
  );
}
