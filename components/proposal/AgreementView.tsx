"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useState, type FormEvent, type ReactNode } from "react";
import { amendBooking, signProposal } from "@/app/(proposals)/proposal/actions";
import { logoCream } from "@/lib/images";
import { bookingTotals, money, pricedRows, type Amendment, type PriceLine, type ProposalContent } from "@/lib/proposals";

// Pacific time, so the server's render and the browser's agree
const zone = { timeZone: "America/Los_Angeles" } as const;
const day = (ms: number) => new Date(ms).toLocaleDateString("en-US", { ...zone, month: "long", day: "numeric", year: "numeric" });
const at = (ms: number) => `${day(ms)} at ${new Date(ms).toLocaleTimeString("en-US", { ...zone, hour: "numeric", minute: "2-digit" })}`;

/** "title | sentence" lines */
const pairs = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [t, ...rest] = l.split("|");
      return { t: t.trim(), b: rest.join("|").trim() };
    })
    .filter((x) => x.t);

type Busy = { busy: boolean; message: string; ok: boolean };
const idle: Busy = { busy: false, message: "", ok: true };

/**
 * The agreement a client signs, at /proposal/<id>/agreement: a plain document, not slides. The
 * event, what's included, the add-ons (they tick more before signing, and the total follows), the
 * numbers, the alcohol, Helen's key terms and the fine print, and the signatures. Once signed it
 * shows what they signed, and they can still add add-ons or ask for a change, each kept with its
 * date. Without a proposal id (Helen's preview of one not sent yet), nothing can be sent.
 */
export default function AgreementView({
  proposalId,
  content: c,
  offered,
  picks,
  signed: signedBefore,
  amendments: amendedBefore,
  fineprint,
  issuedAt,
  topbar,
}: {
  proposalId?: string;
  /** What they signed, or the proposal as it stands */
  content: ProposalContent;
  /** The add-ons on offer now, for adding after signing */
  offered: PriceLine[];
  /** Their add-ons: the ones they signed for, or the ones they sent from the proposal */
  picks: string[];
  signed?: { name: string; at: number };
  amendments: Amendment[];
  fineprint: string;
  issuedAt?: number;
  topbar?: ReactNode;
}) {
  const [signed, setSigned] = useState(signedBefore);
  const [amendments, setAmendments] = useState(amendedBefore);
  const addOnRows = pricedRows(c.addOns, "").rows;
  const [on, setOn] = useState(() => new Set(picks.filter((l) => addOnRows.some((r) => r.label === l))));
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signState, setSignState] = useState<Busy>(idle);
  const [more, setMore] = useState<Set<string>>(() => new Set());
  const [note, setNote] = useState("");
  const [amendState, setAmendState] = useState<Busy>(idle);

  const toggle = (set: (f: (s: Set<string>) => Set<string>) => void, label: string) =>
    set((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });

  // Before signing, the total follows their ticks; after, it's what they signed plus what they added
  const added = amendments.flatMap((a) => a.add);
  const booked = signed ? [...on, ...added] : [...on];
  // After signing, add-ons Helen has offered since can be added too, at today's prices
  const withOffered = signed
    ? { ...c, addOns: [...c.addOns, ...offered.filter((o) => !c.addOns.some((a) => a.label.trim() === o.label.trim()))] }
    : c;
  const totals = bookingTotals(withOffered, booked);
  const addable = pricedRows(offered, "").rows.filter((r) => !booked.includes(r.label));
  const when = (label: string) => amendments.find((a) => a.add.includes(label))?.at;

  const facts = (
    [
      ["Client", c.name.trim()],
      ["Occasion", c.occasion.trim()],
      ["Date", c.date.trim()],
      ["Time", c.time.trim()],
      ["Where", c.venue.trim()],
      ["Guests", c.guests.trim()],
      ["Service", c.serviceWindow.trim()],
    ] as const
  ).filter(([, v]) => v);
  const included = c.included
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const terms = pairs(c.terms);
  const fine = pairs(fineprint);

  async function sign(e: FormEvent) {
    e.preventDefault();
    if (!proposalId) return;
    setSignState({ ...idle, busy: true });
    try {
      const result = await signProposal(proposalId, { name, agreed, picks: [...on] });
      if (result.signed) setSigned(result.signed);
      setSignState({ busy: false, message: result.message, ok: result.ok });
    } catch {
      setSignState({ busy: false, message: "That didn't go through. Check your connection and try again.", ok: false });
    }
  }

  async function amend(e: FormEvent) {
    e.preventDefault();
    if (!proposalId) return;
    setAmendState({ ...idle, busy: true });
    try {
      const result = await amendBooking(proposalId, { add: [...more], note });
      if (result.amendment) {
        const a = result.amendment;
        setAmendments((prev) => [...prev, a]);
        setMore(new Set());
        setNote("");
      }
      setAmendState({ busy: false, message: result.message, ok: result.ok });
    } catch {
      setAmendState({ busy: false, message: "That didn't send. Check your connection and try again.", ok: false });
    }
  }

  return (
    <div id="agreement" data-event={c.eventType || "wedding"}>
      {topbar}
      <main className="admin agr">
        <header className="ahero">
          <div className="ahero-top">
            <Image className="ahero-logo" src={logoCream} alt="Revelrita" preload />
            {signed ? <span className="apill signed">Signed</span> : <span className="agr-tag">Event agreement</span>}
          </div>
          <h1 className="ahero-title">
            {c.name.trim() ? (
              <>
                The agreement for <em>{c.name.trim()}</em>
              </>
            ) : (
              <>
                Your <em>agreement</em>
              </>
            )}
          </h1>
          <p className="ahero-sub">
            {signed
              ? `Signed by ${signed.name} on ${at(signed.at)}. This is your copy: it stays at this link.`
              : "The final details, the numbers and the terms. Add anything else you'd like, then sign at the bottom."}
          </p>
          {proposalId && (
            <p className="agr-back noprint">
              <Link href={`/proposal/${proposalId}`} className="alink">
                &larr; Back to the proposal
              </Link>
            </p>
          )}
        </header>

        {facts.length > 0 && (
          <Card title="The event">
            <dl className="agr-dl">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )}

        {(c.packageName.trim() || included.length > 0) && (
          <Card title={c.packageName.trim() || "What's included"} kicker={c.packageName.trim() ? "What's included" : undefined}>
            <ul className="agr-list">
              {included.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </Card>
        )}

        {addOnRows.length > 0 && (
          <Card
            title="Add ons"
            note={
              signed
                ? "What you booked. Want something else? Add it below."
                : "Tick anything you'd like. It's part of what you sign, and the total below follows along."
            }
          >
            {signed ? (
              totals.addOns.length > 0 ? (
                <ul className="agr-rows">
                  {totals.addOns.map((r) => (
                    <li key={r.label}>
                      <span>
                        {r.label}
                        {when(r.label) && <span className="agr-added">Added {day(when(r.label)!)}</span>}
                      </span>
                      <span className="agr-amt">{r.display}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="aempty">No add-ons yet.</p>
              )
            ) : (
              <AddOnList rows={addOnRows} on={on} onToggle={(l) => toggle(setOn, l)} disabled={false} />
            )}
          </Card>
        )}

        <Card title="The numbers">
          <ul className="agr-rows">
            {totals.service.rows.map((r, i) => (
              <li key={`s${i}`}>
                <span>
                  {r.label}
                  {r.note && <span className="agr-added">{r.note}</span>}
                </span>
                <span className="agr-amt">{r.display}</span>
              </li>
            ))}
            {totals.addOns.map((r) => (
              <li key={r.label}>
                <span>{r.label}</span>
                <span className="agr-amt">{r.display}</span>
              </li>
            ))}
          </ul>
          {totals.counted > 0 && (
            <p className="agr-total">
              <span>Total{totals.unpriced.length > 0 && ", plus the add-ons priced as listed"}</span>
              <strong>{money(totals.total)}</strong>
            </p>
          )}
          {[c.deposit, c.pricingNote, c.holdsFor].some((s) => s.trim()) && (
            <ul className="agr-list agr-notes">
              {[c.deposit, c.pricingNote, c.holdsFor]
                .map((s) => s.trim())
                .filter(Boolean)
                .map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
            </ul>
          )}
        </Card>

        {c.alcohol.trim() && (
          <Card title="The alcohol">
            {c.alcohol
              .split(/\n{2,}/)
              .filter((p) => p.trim())
              .map((p, i) => (
                <p className="agr-p" key={i}>
                  {p.trim()}
                </p>
              ))}
          </Card>
        )}

        {terms.length > 0 && (
          <Card title="Key terms">
            <ol className="agr-terms">
              {terms.map((x, i) => (
                <li key={i}>
                  <strong>{x.t}.</strong> {x.b}
                </li>
              ))}
            </ol>
          </Card>
        )}

        {fine.length > 0 && (
          <Card title="The fine print">
            <ol className="agr-terms agr-fine">
              {fine.map((x, i) => (
                <li key={i}>
                  <strong>{x.t}.</strong> {x.b}
                </li>
              ))}
            </ol>
          </Card>
        )}

        <Card title="Signatures">
          <div className="agr-sigs">
            <div className="agr-sig">
              <span className="agree-k">Client</span>
              {signed ? (
                <>
                  <p className="agree-name">{signed.name}</p>
                  <p className="agree-when">Signed {at(signed.at)}</p>
                  {signState.message && (
                    <p className="addon-msg noprint" role="status">
                      {signState.message}
                    </p>
                  )}
                </>
              ) : (
                <form onSubmit={sign}>
                  <label className="agr-label" htmlFor="agreeName">
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
                      <span className="addon-name">I agree to this agreement and its terms</span>
                      <span className="addon-note">Typing your name and signing counts as your signature.</span>
                    </span>
                  </label>
                  {proposalId ? (
                    <div className="agree-send noprint">
                      <button type="submit" className="btn" disabled={signState.busy || !name.trim() || !agreed}>
                        {signState.busy ? "Signing..." : "Sign and book"}
                      </button>
                      {signState.message && (
                        <p className={`addon-msg${signState.ok ? "" : " err"}`} role="status">
                          {signState.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="addon-msg noprint">Your client signs here once you send it.</p>
                  )}
                </form>
              )}
            </div>
            <div className="agr-sig">
              <span className="agree-k">Revelrita</span>
              <p className="agree-name">Helen Bowman</p>
              <p className="agree-when">{issuedAt ? `Sent ${day(issuedAt)}` : "Not sent yet"}</p>
            </div>
          </div>
        </Card>

        {signed && (
          <Card title="Changes since signing" note="Add something, or tell Helen what you'd like to change. Each one is kept here with its date.">
            {amendments.length > 0 && (
              <ul className="agr-rows agr-changes">
                {amendments.map((a, i) => {
                  const rows = bookingTotals(withOffered, a.add).addOns;
                  return (
                    <li key={i}>
                      <span>
                        {[rows.length ? `Added ${rows.map((r) => r.label).join(", ")}` : "", a.note ? `“${a.note}”` : ""]
                          .filter(Boolean)
                          .map((t, j) => (
                            <Fragment key={j}>
                              {j > 0 && <br />}
                              {t}
                            </Fragment>
                          ))}
                      </span>
                      <span className="agr-added">{at(a.at)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <form onSubmit={amend} className="noprint">
              {addable.length > 0 && (
                <>
                  <p className="agr-label">Add to your booking</p>
                  <AddOnList rows={addable} on={more} onToggle={(l) => toggle(setMore, l)} disabled={!proposalId} />
                </>
              )}
              <label className="agr-label" htmlFor="agrNote">
                Anything else to change? (guest count, timing, the menu...)
              </label>
              <textarea
                id="agrNote"
                className="agr-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={!proposalId}
              />
              <div className="agree-send">
                <button type="submit" className="btn" disabled={!proposalId || amendState.busy || (!more.size && !note.trim())}>
                  {amendState.busy ? "Sending..." : "Send my changes"}
                </button>
                {amendState.message && (
                  <p className={`addon-msg${amendState.ok ? "" : " err"}`} role="status">
                    {amendState.message}
                  </p>
                )}
              </div>
            </form>
          </Card>
        )}

        <p className="agr-print noprint">
          <button type="button" className="ebtn ghost" onClick={() => window.print()}>
            Save as PDF
          </button>
        </p>
      </main>
    </div>
  );
}

function Card({ title, kicker, note, children }: { title: string; kicker?: string; note?: string; children: ReactNode }) {
  return (
    <section className="acard agr-card">
      <div className="acard-head">
        <h2>
          {kicker && <span className="agr-kicker">{kicker}</span>}
          {title}
        </h2>
        {note && <p>{note}</p>}
      </div>
      {children}
    </section>
  );
}

/** Tickable add-on rows, in the proposal's "Make it yours" look */
function AddOnList({
  rows,
  on,
  onToggle,
  disabled,
}: {
  rows: { label: string; note: string; display: string }[];
  on: Set<string>;
  onToggle: (label: string) => void;
  disabled: boolean;
}) {
  return (
    <ul className="addon-list agr-addons">
      {rows.map((r) => (
        <li key={r.label}>
          <label className={`addon${on.has(r.label) ? " on" : ""}`}>
            <input type="checkbox" checked={on.has(r.label)} onChange={() => onToggle(r.label)} disabled={disabled} />
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
  );
}
