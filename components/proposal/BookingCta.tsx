"use client";

import Link from "next/link";
import { useState } from "react";
import { requestBooking } from "@/app/(proposals)/proposal/actions";

/**
 * The proposal's way to say yes: "We want to book!" tells Helen (requestBooking), and once she's
 * sent the agreement it becomes the way to it. In the builder's Preview there's no proposal id,
 * so it shows but doesn't send.
 */
export default function BookingCta({
  proposalId,
  requested,
  agreementReady,
  signed,
}: {
  proposalId?: string;
  requested: boolean;
  agreementReady: boolean;
  signed: boolean;
}) {
  const [state, setState] = useState<{ busy: boolean; done: boolean; message: string; ok: boolean }>({
    busy: false,
    done: requested,
    message: "",
    ok: true,
  });

  if (proposalId && (agreementReady || signed)) {
    return (
      <div className="book-cta noprint">
        <Link className="btn" href={`/proposal/${proposalId}/agreement`}>
          {signed ? "You're booked! See your agreement" : "Review and sign your agreement"} &rarr;
        </Link>
      </div>
    );
  }

  async function book() {
    if (!proposalId) return;
    setState((s) => ({ ...s, busy: true, message: "" }));
    try {
      const result = await requestBooking(proposalId);
      setState({ busy: false, done: result.ok, message: result.message, ok: result.ok });
    } catch {
      setState({ busy: false, done: false, message: "That didn't send. Check your connection and try again.", ok: false });
    }
  }

  return (
    <div className="book-cta noprint">
      <button type="button" className="btn" onClick={book} disabled={!proposalId || state.busy || state.done}>
        {state.busy ? "Sending..." : state.done ? "✓ Helen's on it" : "We want to book!"}
      </button>
      <p className={`addon-msg${state.ok ? "" : " err"}`} role="status">
        {!proposalId
          ? "Your client taps this on their link, and you get an email."
          : state.message || (state.done ? "She'll send your agreement to sign." : "Tap it and Helen will send over the agreement.")}
      </p>
    </div>
  );
}
