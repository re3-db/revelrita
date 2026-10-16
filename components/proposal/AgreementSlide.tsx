"use client";

import { useState, type FormEvent } from "react";
import { signProposal } from "@/app/(proposals)/proposal/actions";
import { money, pricedRows, type ProposalContent } from "@/lib/proposals";

// Pacific time, so the server's render and the browser's agree
const signedOn = (ms: number) => {
  const d = new Date(ms);
  const zone = { timeZone: "America/Los_Angeles" } as const;
  return `${d.toLocaleDateString("en-US", { ...zone, month: "long", day: "numeric", year: "numeric" })} at ${d.toLocaleTimeString("en-US", { ...zone, hour: "numeric", minute: "2-digit" })}`;
};

/**
 * "Make it official": what they're booking, the proposal's terms, and a place to sign (their typed
 * name and a tick). Signing saves it on the proposal and emails Helen and the client (signProposal).
 * Once signed, it shows who signed and when, with what they signed (ProposalView passes the copy
 * kept with the signature). In the builder's Preview there's no proposal id, so nothing can be signed.
 */
export default function AgreementSlide({
  content: d,
  terms,
  picks,
  proposalId,
  signed: signedBefore,
}: {
  content: ProposalContent;
  terms: { t: string; b: string }[];
  /** The add-ons they sent back, part of what they're booking */
  picks: string[];
  proposalId?: string;
  signed?: { name: string; at: number };
}) {
  const [signed, setSigned] = useState(signedBefore);
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [state, setState] = useState<{ busy: boolean; message: string; ok: boolean }>({ busy: false, message: "", ok: true });

  const service = pricedRows(d.pricing);
  const picked = pricedRows(d.addOns, "").rows.filter((r) => picks.includes(r.label));
  const booking = (
    [
      ["Event", [d.occasion, d.date, d.time].map((s) => s.trim()).filter(Boolean).join(", ")],
      ["Where", d.venue.trim()],
      ["Guests", d.guests.trim()],
      ["Package", d.packageName.trim()],
      ["Service total", service.counted.length ? money(service.total) : ""],
      ["Add ons", picked.map((r) => (r.display ? `${r.label} (${r.display})` : r.label)).join(", ")],
      ["Deposit", d.deposit.trim()],
    ] as const
  ).filter(([, v]) => v);

  async function sign(e: FormEvent) {
    e.preventDefault();
    if (!proposalId) return;
    setState({ busy: true, message: "", ok: true });
    try {
      const result = await signProposal(proposalId, { name, agreed });
      if (result.signed) setSigned(result.signed);
      setState({ busy: false, message: result.message, ok: result.ok });
    } catch {
      setState({ busy: false, message: "That didn't go through. Check your connection and try again.", ok: false });
    }
  }

  return (
    <section className="slide agree-slide">
      <span className="eyebrow">The agreement</span>
      <h2 className="sec-title">
        Make it <em>official</em>
      </h2>
      <div className="agree-grid">
        <div>
          {booking.length > 0 && (
            <>
              <h3 className="money-h">What you&apos;re booking</h3>
              <dl className="agree-book">
                {booking.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
          {terms.length > 0 && (
            <>
              <h3 className="money-h">The terms</h3>
              <ol className="agree-terms">
                {terms.map((x, i) => (
                  <li key={i}>
                    <span className="wn-t">{x.t}</span>
                    {x.b && <span className="wn-b">{x.b}</span>}
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
        <div className="agree-sign">
          {signed ? (
            <div className="agree-done">
              <span className="agree-k">Signed</span>
              <p className="agree-name">{signed.name}</p>
              <p className="agree-when">{signedOn(signed.at)}</p>
              <p className="agree-for">For Revelrita: Helen Bowman</p>
              {state.message && (
                <p className="addon-msg noprint" role="status">
                  {state.message}
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={sign}>
              <label className="agree-k" htmlFor="agreeName">
                Type your full name to sign
              </label>
              <input
                id="agreeName"
                className="agree-input"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                disabled={!proposalId}
              />
              <label className={`addon agree-tick${agreed ? " on" : ""}`}>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} disabled={!proposalId} />
                <span className="addon-box" aria-hidden="true" />
                <span className="addon-text">
                  <span className="addon-name">I agree to this proposal and its terms</span>
                  <span className="addon-note">Typing your name and signing counts as your signature.</span>
                </span>
              </label>
              <p className="agree-for">For Revelrita: Helen Bowman</p>
              {proposalId ? (
                <div className="agree-send noprint">
                  <button type="submit" className="btn" disabled={state.busy || !name.trim() || !agreed}>
                    {state.busy ? "Signing..." : "Sign and book"}
                  </button>
                  {state.message && (
                    <p className={`addon-msg${state.ok ? "" : " err"}`} role="status">
                      {state.message}
                    </p>
                  )}
                </div>
              ) : (
                <p className="addon-msg noprint">Your client signs from their link.</p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
