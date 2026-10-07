import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/admin-auth";
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
    <>
      <div className="bhead">
        <div className="bwrap">
          <h1>Revelrita proposals</h1>
          <p>Log in to see your drafts and send proposals.</p>
        </div>
      </div>
      <div className="bwrap">
        {adminConfigured() ? (
          <form action={login}>
            <fieldset>
              <legend>Log in</legend>
              <input type="hidden" name="next" value={next} />
              <div className="stack">
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus />
                {params.error && <p className="hint error">That&apos;s not it. Try again.</p>}
              </div>
              <button type="submit" className="btn">
                Log in
              </button>
            </fieldset>
          </form>
        ) : (
          <div className="setup">
            <h2>Almost there</h2>
            <p>
              Set an <strong>ADMIN_PASSWORD</strong> in Vercel (Project, Settings, Environment Variables), then redeploy.
              That password is what you&apos;ll log in with here.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
