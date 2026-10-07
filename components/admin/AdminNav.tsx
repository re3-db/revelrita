import Link from "next/link";
import { logout } from "@/app/(proposals)/admin/actions";

/** The admin's tabs, top right of each page's header */
export default function AdminNav({ current }: { current: "proposals" | "events" }) {
  const tab = (key: typeof current, href: string, label: string) => (
    <Link href={href} className={current === key ? "on" : undefined} aria-current={current === key ? "page" : undefined}>
      {label}
    </Link>
  );
  return (
    <nav className="anav" aria-label="Admin">
      {tab("proposals", "/admin", "Proposals")}
      {tab("events", "/admin/events", "Events")}
      <form action={logout}>
        <button type="submit" className="alink">
          Log out
        </button>
      </form>
    </nav>
  );
}
