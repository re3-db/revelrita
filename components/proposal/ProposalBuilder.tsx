"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { markSent, removeProposal, saveDraft, sendProposal, type SaveResult } from "@/app/(proposals)/admin/actions";
import ProposalView, { photos } from "@/components/proposal/ProposalView";
import {
  DEFAULT_ALCOHOL,
  defaultMessage,
  defaultSubject,
  eventTypes,
  money,
  photoKeys,
  photoLabels,
  pricedRows,
  type EventType,
  type PriceLine,
  type Proposal,
  type ProposalContent,
} from "@/lib/proposals";

/**
 * The proposal builder from Helen's artifact, on the site: the same fields and defaults,
 * laid out as cream cards like the proposals list. Proposals save to the site as she types
 * (instead of into a link), and "Send" emails the client a link to /proposal/<id>.
 * Preview shows the client's page exactly as the artifact rendered it.
 */

type TextKey = { [K in keyof ProposalContent]: ProposalContent[K] extends string ? K : never }[keyof ProposalContent];
type Meta = NonNullable<SaveResult["proposal"]>;
type SaveState = "saved" | "unsaved" | "saving" | "error";

const emptyRow = (): PriceLine => ({ label: "", amount: "", note: "" });

// Pacific time, so the server's render and the browser's agree
const day = (ms: number) =>
  new Date(ms).toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export default function ProposalBuilder({ proposal, link }: { proposal: Proposal; link: string }) {
  const [content, setContent] = useState<ProposalContent>(() => ({
    ...proposal.content,
    pricing: proposal.content.pricing.length ? proposal.content.pricing : [emptyRow(), emptyRow()],
  }));
  const [clientEmail, setClientEmail] = useState(proposal.clientEmail);
  const [meta, setMeta] = useState<Meta>({
    status: proposal.status,
    updatedAt: proposal.updatedAt,
    sentAt: proposal.sentAt,
    sentTo: proposal.sentTo,
  });
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);
  const sent = meta.status === "sent";

  /* ---------- saving ---------- */

  const dirty = useRef(false);
  const saveCount = useRef(0);
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const say = useCallback((text: string) => setToast({ text, key: Date.now() }), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  /** Runs saves and sends one at a time, so an older save can't land on top of a newer one. */
  const run = useCallback((task: () => Promise<SaveResult>, failure: string) => {
    const count = ++saveCount.current;
    dirty.current = false;
    setSaveState("saving");
    const next = queue.current.then(async () => {
      let result: SaveResult;
      try {
        result = await task();
      } catch {
        result = { ok: false, message: failure };
      }
      if (result.proposal) setMeta(result.proposal);
      // Only the latest save decides what the Save button says
      if (count === saveCount.current) {
        if (!result.ok) {
          dirty.current = true;
          say(result.message);
        }
        setSaveState(result.ok ? "saved" : "error");
      }
      return result;
    });
    queue.current = next;
    return next;
  }, [say]);

  const save = useCallback(
    (c: ProposalContent, email: string) =>
      run(() => saveDraft(proposal.id, c, email), "Couldn't save. Check your connection and try again."),
    [run, proposal.id],
  );

  // Saves a second after the last change, like the artifact saving as you type
  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(() => save(content, clientEmail), 1000);
    return () => clearTimeout(t);
  }, [content, clientEmail, save]);

  // Don't lose unsaved typing to a closed tab
  useEffect(() => {
    if (saveState === "saved") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState]);

  const change = useCallback((next: Partial<ProposalContent>) => {
    dirty.current = true;
    setSaveState("unsaved");
    setContent((c) => ({ ...c, ...next }));
  }, []);

  /** Props for an input or textarea bound to a text field */
  const bind = (key: TextKey) => ({
    id: `f_${key}`,
    value: content[key],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => change({ [key]: e.target.value }),
  });

  /* ---------- pricing rows ---------- */

  const setRow = (i: number, next: Partial<PriceLine>) =>
    change({ pricing: content.pricing.map((r, j) => (j === i ? { ...r, ...next } : r)) });
  const removeRow = (i: number) => {
    const rows = content.pricing.filter((_, j) => j !== i);
    change({ pricing: rows.length ? rows : [emptyRow()] });
  };

  /* ---------- buttons ---------- */

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      say("Client link copied");
    } catch {
      say("Copy failed, try again");
    }
  }

  function showPreview() {
    setPreview(true);
    window.scrollTo({ top: 0 });
  }

  async function onDelete() {
    if (!window.confirm(`Delete the proposal for ${content.name.trim() || "this client"}? This can't be undone.`)) return;
    dirty.current = false;
    setSaveState("saved");
    await removeProposal(proposal.id);
  }

  if (preview) {
    return (
      <ProposalView
        content={content}
        topbar={
          <div id="editbar" className="topbar">
            <div className="wrap">
              <span>This is what your client sees.</span>
              <span style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => window.print()}>
                  Save as PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreview(false);
                    window.scrollTo({ top: 0 });
                  }}
                >
                  Back to editor
                </button>
              </span>
            </div>
          </div>
        }
      />
    );
  }

  const answers = proposal.inquiry?.answers.filter(([, a]) => a) ?? [];
  const who = content.name.trim();
  const { counted, total } = pricedRows(content.pricing);

  return (
    <div id="builder" className="ed">
      <div className="ed-wrap">
        <header className="ahero ed-hero">
          <div className="ahero-top">
            <Link href="/admin" className="alink">
              &larr; All proposals
            </Link>
            <span className={`apill ${sent ? "sent" : "draft"}`}>{sent ? "Sent" : "Draft"}</span>
          </div>
          <h1 className="ahero-title">
            {who ? (
              <>
                Proposal for <em>{who}</em>
              </>
            ) : (
              <>
                New <em>proposal</em>
              </>
            )}
          </h1>
          <p className="ahero-sub">
            {sent
              ? `${meta.sentTo ? `Emailed to ${meta.sentTo}` : "Marked as sent"}${meta.sentAt ? ` on ${day(meta.sentAt)}` : ""}. Changes you make here show up on their page as they save.`
              : `${proposal.inquiry ? `Made from the inquiry ${proposal.inquiry.answers[0]?.[1] || "someone"} sent on ${day(proposal.inquiry.receivedAt)}. ` : ""}It saves as you type, and nothing goes to the client until you hit Send.`}
          </p>
          {sent && (
            <p className="ed-open">
              <a className="alink" href={link} target="_blank" rel="noreferrer">
                Open their page &#8599;
              </a>
            </p>
          )}
        </header>

        {answers.length > 0 && (
          <details className="ecard einq" open={!sent}>
            <summary>What they sent through the website</summary>
            <dl>
              {answers.map(([q, a]) => (
                <div key={q}>
                  <dt>{q}</dt>
                  <dd>{a}</dd>
                </div>
              ))}
            </dl>
          </details>
        )}

        <Card title="The event" note="The basics. They show at the top of the proposal.">
          <div className="egrid">
            <Field label="Who it's for" htmlFor="f_name" hint="The greeting says “Hey, [this].”">
              <input {...bind("name")} placeholder="e.g. Sarah + Mike" />
            </Field>
            <Field label="Their email" htmlFor="f_clientEmail" hint="Where Send to client goes.">
              <input
                id="f_clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => {
                  dirty.current = true;
                  setSaveState("unsaved");
                  setClientEmail(e.target.value);
                }}
                placeholder="e.g. sarah@email.com"
              />
            </Field>
          </div>
          <div className="estack">
            <span className="elabel" id="eventTypeLabel">
              Event type
            </span>
            <div className="eseg" role="radiogroup" aria-labelledby="eventTypeLabel">
              {eventTypes.map((t) => (
                <label key={t.value} className={content.eventType === t.value ? "on" : undefined}>
                  <input
                    type="radio"
                    name="eventType"
                    value={t.value}
                    checked={content.eventType === t.value}
                    onChange={() => change({ eventType: t.value as EventType })}
                  />
                  {t.label}
                </label>
              ))}
            </div>
            <p className="ehint">Sets the accent color, and “Hi” or “Hey” in the greeting.</p>
          </div>
          <div className="egrid">
            <Field label="Occasion" htmlFor="f_occasion">
              <input {...bind("occasion")} placeholder="e.g. Wedding reception" />
            </Field>
            <Field label="Date" htmlFor="f_date">
              <input {...bind("date")} placeholder="e.g. Saturday, June 13" />
            </Field>
            <Field label="Venue or location" htmlFor="f_venue">
              <input {...bind("venue")} placeholder="e.g. Private home, Leucadia" />
            </Field>
            <Field label="Guest count" htmlFor="f_guests">
              <input {...bind("guests")} placeholder="e.g. 85 guests" />
            </Field>
            <Field label="Service window" htmlFor="f_serviceWindow">
              <input {...bind("serviceWindow")} placeholder="e.g. 4 hours, 5:00 to 9:00" />
            </Field>
          </div>
          <Field label="Opening note" htmlFor="f_intro" hint="Two or three sentences, the way you'd write it in a text.">
            <textarea
              {...bind("intro")}
              rows={3}
              placeholder="e.g. So glad you reached out. Here's what I'm picturing for your day."
            />
          </Field>
        </Card>

        <Card title="What they get">
          <Field label="Package name" htmlFor="f_packageName">
            <input {...bind("packageName")} placeholder="e.g. The Coastal Cart" />
          </Field>
          <Field label="What's included" htmlFor="f_included" hint="One per line.">
            <textarea {...bind("included")} rows={9} />
          </Field>
        </Card>

        <Card title="The opening statement" note="Leave both empty to skip this slide.">
          <Field label="Headline" htmlFor="f_visionTitle">
            <input {...bind("visionTitle")} placeholder="e.g. We bring the party, minus the logistics." />
          </Field>
          <Field label="A short paragraph" htmlFor="f_visionBody">
            <textarea {...bind("visionBody")} rows={4} />
          </Field>
        </Card>

        <Card title="What makes Revelrita different" note="Leave empty to skip this slide. The first four show.">
          <Field label="One per line: a short title, then | and one sentence" htmlFor="f_different">
            <textarea {...bind("different")} rows={5} />
          </Field>
        </Card>

        <Card title="Questions people ask" note="Leave empty to skip this slide.">
          <Field label="One per line: the question, then | and the answer" htmlFor="f_faq">
            <textarea {...bind("faq")} rows={6} />
          </Field>
        </Card>

        <Card title="Client quote" note="Leave empty to skip this slide.">
          <Field label="What they said" htmlFor="f_quote">
            <textarea {...bind("quote")} rows={5} />
          </Field>
          <Field label="Who said it" htmlFor="f_quoteBy">
            <input {...bind("quoteBy")} placeholder="e.g. Jess, backyard 40th in Encinitas" />
          </Field>
        </Card>

        <Card title="Photos" note="Tap the ones you want in this proposal.">
          <div className="ephotos">
            {photoKeys.map((k) => {
              const on = content.photos.includes(k);
              return (
                <label key={k} className={`ephoto${on ? " on" : ""}`}>
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) =>
                      change({
                        photos: e.target.checked ? [...content.photos, k] : content.photos.filter((p) => p !== k),
                      })
                    }
                  />
                  <Image src={photos[k].src} alt="" sizes="(max-width: 600px) 45vw, 200px" />
                  <span className="ephoto-label">{photoLabels[k]}</span>
                </label>
              );
            })}
          </div>
        </Card>

        <Card title="The menu" note="Leave the drinks empty to hide the menu until it's built.">
          <Field label="Menu heading" htmlFor="f_menuTitle">
            <input {...bind("menuTitle")} placeholder="e.g. Two signature drinks, beer and wine" />
          </Field>
          <Field
            label="Drinks, one per line: the name, then | and the ingredients"
            htmlFor="f_menu"
            hint="Names and ingredients only, no descriptions."
          >
            <textarea
              {...bind("menu")}
              rows={6}
              placeholder="e.g. Passion Fruit Marg | tequila blanco, passion fruit, lime, agave"
            />
          </Field>
        </Card>

        <Card title="Pricing" note="Amounts get added up for you. You can also write “Included” or “TBD” and it shows as typed.">
          <div className="eprice">
            <div className="prhead">
              <span>What it covers</span>
              <span>Amount</span>
              <span>Note (optional)</span>
              <span></span>
            </div>
            <div id="prRows">
              {content.pricing.map((row, i) => (
                <div className="prrow" key={i}>
                  <input
                    className="pr-l"
                    aria-label="What it covers"
                    placeholder="e.g. Bar cart and two bartenders, 4 hours"
                    value={row.label}
                    onChange={(e) => setRow(i, { label: e.target.value })}
                  />
                  <input
                    className="pr-a"
                    aria-label="Amount"
                    placeholder="e.g. 850"
                    value={row.amount}
                    onChange={(e) => setRow(i, { amount: e.target.value })}
                  />
                  <input
                    className="pr-n"
                    aria-label="Note"
                    value={row.note}
                    onChange={(e) => setRow(i, { note: e.target.value })}
                  />
                  <button type="button" className="pr-x" aria-label="Remove this line" onClick={() => removeRow(i)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="eprice-foot">
              <button type="button" className="elink" onClick={() => change({ pricing: [...content.pricing, emptyRow()] })}>
                + Add another line
              </button>
              {counted.length > 0 && (
                <span className="eprice-total">
                  Service total <strong>{money(total)}</strong>
                </span>
              )}
            </div>
          </div>
          <div className="egrid">
            <Field label="Deposit line" htmlFor="f_deposit">
              <input {...bind("deposit")} placeholder="e.g. $200 deposit holds the date" />
            </Field>
            <Field label="Good through" htmlFor="f_holdsFor">
              <input {...bind("holdsFor")} placeholder="e.g. This quote holds for 7 days" />
            </Field>
          </div>
          <Field label="Peak date line" htmlFor="f_peak" hint="Leave empty if it's not a peak date.">
            <input {...bind("peak")} placeholder="e.g. This is a peak Saturday, and peak dates are priced accordingly." />
          </Field>
          <Field
            label="What's in the number: one per line, a short title, then | and one sentence"
            htmlFor="f_inTheNumber"
            hint="Leave empty to skip it."
          >
            <textarea {...bind("inTheNumber")} rows={6} />
          </Field>
          <Field label="Pricing note" htmlFor="f_pricingNote">
            <input {...bind("pricingNote")} placeholder="e.g. Final count confirmed two weeks out" />
          </Field>
        </Card>

        <Card title="The alcohol">
          <Field
            label="How the two payments work"
            htmlFor="f_alcohol"
            hint={
              <>
                Edit it if this event&apos;s different.{" "}
                <button
                  type="button"
                  className="elink"
                  onClick={() => {
                    change({ alcohol: DEFAULT_ALCOHOL });
                    say("Standard wording restored");
                  }}
                >
                  Use my standard wording
                </button>
              </>
            }
          >
            <textarea {...bind("alcohol")} rows={7} />
          </Field>
        </Card>

        <Card title="Next steps and contact">
          <Field label="Steps, one per line" htmlFor="f_steps">
            <textarea {...bind("steps")} rows={4} />
          </Field>
          <div className="egrid">
            <Field label="Your email" htmlFor="f_email">
              <input {...bind("email")} />
            </Field>
            <Field label="Your phone" htmlFor="f_phone">
              <input {...bind("phone")} />
            </Field>
          </div>
          <Field label="Sign-off" htmlFor="f_signOff">
            <input {...bind("signOff")} placeholder="e.g. Can't wait. Let's make it a party." />
          </Field>
        </Card>

        <p className="edelete">
          <button type="button" className="elink danger" onClick={onDelete}>
            Delete this proposal
          </button>
        </p>
      </div>

      <div className="ebar noprint">
        <div className="ebar-inner">
          <button type="button" className="ebtn ghost" onClick={showPreview}>
            Preview
          </button>
          <button
            type="button"
            className={`ebtn ghost esave ${saveState}`}
            onClick={() => save(content, clientEmail)}
            disabled={saveState === "saving"}
          >
            {saveState === "saving"
              ? "Saving..."
              : saveState === "saved"
                ? "✓ Saved"
                : saveState === "error"
                  ? "Not saved, retry"
                  : "Save"}
          </button>
          <span className="ebar-space" />
          {sent && (
            <button type="button" className="ebtn ghost" onClick={copyLink}>
              Copy client link
            </button>
          )}
          <button type="button" className="ebtn primary" onClick={() => setSending(true)}>
            {sent ? "Send again" : "Send to client"}
          </button>
        </div>
      </div>

      {sending && (
        <SendPanel
          name={content.name}
          email={clientEmail}
          subject={defaultSubject(content)}
          message={defaultMessage(content)}
          onClose={() => setSending(false)}
          onSend={async ({ to, subject, message }) => {
            setClientEmail(to);
            const result = await run(
              () => sendProposal(proposal.id, { content, clientEmail: to, subject, message }),
              "That didn't send. Check your connection and try again.",
            );
            say(result.message);
            if (result.ok) setSending(false);
          }}
          onCopyInstead={async (to) => {
            setClientEmail(to);
            const result = await run(
              () => markSent(proposal.id, content, to),
              "That didn't work. Check your connection and try again.",
            );
            if (!result.ok) return say(result.message);
            setSending(false);
            await copyLink();
          }}
        />
      )}

      {toast && (
        <div className="toast" key={toast.key} role="status">
          {toast.text}
        </div>
      )}
    </div>
  );
}

/** One section of the editor, a cream card like a proposal slide */
function Card({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="ecard">
      <div className="ecard-head">
        <h2>{title}</h2>
        {note && <p>{note}</p>}
      </div>
      {children}
    </section>
  );
}

/** A labelled field */
function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="estack">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="ehint">{hint}</p>}
    </div>
  );
}

/** "Send to client": the email they get, editable before it goes. */
function SendPanel({
  name,
  email,
  subject: initialSubject,
  message: initialMessage,
  onClose,
  onSend,
  onCopyInstead,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
  onClose: () => void;
  onSend: (email: { to: string; subject: string; message: string }) => Promise<void>;
  onCopyInstead: (to: string) => Promise<void>;
}) {
  const [to, setTo] = useState(email);
  const [subject, setSubject] = useState(initialSubject);
  const [message, setMessage] = useState(initialMessage);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  async function run(task: () => Promise<void>) {
    setBusy(true);
    try {
      await task();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <form
        className="sendbox"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sendTitle"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => onSend({ to: to.trim(), subject, message }));
        }}
      >
        <h2 id="sendTitle">Send it{name.trim() ? ` to ${name.trim()}` : ""}</h2>
        <Field label="To" htmlFor="s_to">
          <input id="s_to" type="email" required value={to} onChange={(e) => setTo(e.target.value)} autoFocus />
        </Field>
        <Field label="Subject" htmlFor="s_subject">
          <input id="s_subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Field>
        <Field
          label="Message"
          htmlFor="s_message"
          hint="They get this with a button to their proposal. It comes from fun@revelrita.com, so replies land in your inbox."
        >
          <textarea id="s_message" rows={9} value={message} onChange={(e) => setMessage(e.target.value)} />
        </Field>
        <div className="esend-actions">
          <button type="submit" className="ebtn primary" disabled={busy}>
            {busy ? "Sending..." : "Send it"}
          </button>
          <button type="button" className="ebtn ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
        </div>
        <p className="esend-alt">
          Rather text or DM it yourself?{" "}
          <button type="button" className="elink" disabled={busy} onClick={() => run(() => onCopyInstead(to.trim()))}>
            Mark it sent and copy the link
          </button>
        </p>
      </form>
    </div>
  );
}
