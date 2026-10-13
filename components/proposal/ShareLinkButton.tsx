"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { shareProposal } from "@/app/(proposals)/admin/actions";

/**
 * "Share link": the client's link on its own, ready to paste into a text or an email. Phones
 * open the share sheet, computers copy it. A draft's link only opens for Helen, so sharing one
 * marks it sent. The share or copy starts inside the tap, before anything is awaited, because
 * Safari refuses both once the tap is over.
 */
export default function ShareLinkButton({
  id,
  link,
  draft,
  markSent,
}: {
  id: string;
  link: string;
  draft: boolean;
  /** The builder's way to mark it sent (in line with its saves). Elsewhere the page refreshes. */
  markSent?: () => Promise<boolean>;
}) {
  const router = useRouter();
  const [label, setLabel] = useState<string | null>(null);

  function flash(text: string) {
    setLabel(text);
    setTimeout(() => setLabel(null), 2500);
  }

  function share() {
    const phone = typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches;
    const handed: Promise<"shared" | "copied" | "cancelled" | "failed"> = phone
      ? navigator.share({ title: "Your Revelrita proposal", url: link }).then(
          () => "shared",
          (e: unknown) => (e instanceof DOMException && e.name === "AbortError" ? "cancelled" : "failed"),
        )
      : navigator.clipboard.writeText(link).then(
          () => "copied",
          () => "failed",
        );
    const live = !draft
      ? Promise.resolve(true)
      : markSent
        ? markSent()
        : shareProposal(id).then(
            (r) => {
              if (r.ok) router.refresh();
              return r.ok;
            },
            () => false,
          );
    Promise.all([handed, live]).then(([how, ok]) => {
      if (!ok) flash("Link isn't live yet, try again");
      else if (how === "copied") flash("✓ Link copied");
      else if (how === "failed") flash("Couldn't copy, try again");
    });
  }

  return (
    <button type="button" className="ebtn ghost" onClick={share}>
      {label ?? "Share link"}
    </button>
  );
}
