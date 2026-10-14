"use client";

import { useState } from "react";
import { sendPicks } from "@/app/(proposals)/proposal/actions";
import { money, pricedRows, type PriceLine } from "@/lib/proposals";

/**
 * "Make it yours": the proposal's add-ons as tickable rows with their prices, a running total,
 * and "Send my picks", which saves them on the proposal and emails Helen. In the builder's
 * Preview there's no proposal id, so the ticks work but nothing sends.
 */
export default function AddOnsSlide({
  addOns,
  pricing,
  picked,
  proposalId,
}: {
  addOns: PriceLine[];
  /** The service lines, for "with your add-ons" */
  pricing: PriceLine[];
  /** What the client sent last time */
  picked: string[];
  proposalId?: string;
}) {
  const { rows } = pricedRows(addOns, "");
  const [on, setOn] = useState(() => new Set(picked.filter((l) => rows.some((r) => r.label === l))));
  const [saved, setSaved] = useState(() => [...on]);
  const [state, setState] = useState<{ busy: boolean; message: string; ok: boolean }>({ busy: false, message: "", ok: true });

  const chosen = rows.filter((r) => on.has(r.label));
  const addOnTotal = chosen.reduce((sum, r) => sum + (r.num ?? 0), 0);
  const unpriced = chosen.some((r) => r.num === null);
  const service = pricedRows(pricing);
  const changed = saved.length !== on.size || saved.some((l) => !on.has(l));

  function toggle(label: string) {
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
    setState((s) => ({ ...s, message: "" }));
  }

  async function send() {
    if (!proposalId) return;
    const labels = [...on];
    setState({ busy: true, message: "", ok: true });
    try {
      const result = await sendPicks(proposalId, labels);
      if (result.ok) setSaved(labels);
      setState({ busy: false, message: result.message, ok: result.ok });
    } catch {
      setState({ busy: false, message: "That didn't send. Check your connection and try again.", ok: false });
    }
  }

  return (
    <section className="slide addons-slide">
      <span className="eyebrow">Add ons</span>
      <h2 className="sec-title">
        Make it <em>yours</em>
      </h2>
      <p className="addons-sub">Tick anything you&apos;d like to add, then send your picks over.</p>
      <ul className="addon-list">
        {rows.map((r) => (
          <li key={r.label}>
            <label className={`addon${on.has(r.label) ? " on" : ""}`}>
              <input type="checkbox" checked={on.has(r.label)} onChange={() => toggle(r.label)} />
              <span className="addon-box" aria-hidden="true" />
              <span className="addon-text">
                <span className="addon-name">{r.label}</span>
                {r.note && <span className="addon-note">{r.note}</span>}
              </span>
              {r.display && <span className="addon-price">{r.display}</span>}
            </label>
          </li>
        ))}
      </ul>
      <div className="addon-foot">
        <div className="addon-total" aria-live="polite">
          {chosen.length === 0 ? (
            <span className="addon-none">Nothing added yet.</span>
          ) : (
            <>
              <span>
                {chosen.length} add-on{chosen.length === 1 ? "" : "s"}
                {addOnTotal > 0 && (
                  <>
                    : <strong>{money(addOnTotal)}</strong>
                  </>
                )}
                {unpriced && (addOnTotal > 0 ? " plus what's priced as listed" : ", priced as listed")}
              </span>
              {addOnTotal > 0 && service.counted.length > 0 && (
                <span>
                  With your service total: <strong>{money(service.total + addOnTotal)}</strong>
                </span>
              )}
            </>
          )}
        </div>
        {proposalId ? (
          <div className="addon-send noprint">
            <button type="button" className="btn" onClick={send} disabled={state.busy || !changed}>
              {state.busy ? "Sending..." : !changed && saved.length > 0 ? "✓ Picks sent" : "Send my picks"}
            </button>
            {state.message && (
              <p className={`addon-msg${state.ok ? "" : " err"}`} role="status">
                {state.message}
              </p>
            )}
          </div>
        ) : (
          <p className="addon-msg noprint">Your client sends their picks from their link.</p>
        )}
      </div>
    </section>
  );
}
