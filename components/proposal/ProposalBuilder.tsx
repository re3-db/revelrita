"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { markSent, removeProposal, saveDraft, sendProposal, type SaveResult } from "@/app/(proposals)/admin/actions";
import ProposalView from "@/components/proposal/ProposalView";
import {
  DEFAULT_ALCOHOL,
  defaultMessage,
  defaultSubject,
  eventTypes,
  photoKeys,
  photoLabels,
  type EventType,
  type PriceLine,
  type Proposal,
  type ProposalContent,
} from "@/lib/proposals";

/**
 * The proposal builder from Helen's artifact, on the site: the same form, fieldsets and
 * bottom bar, but proposals save to the site as she types (instead of into a link), and
 * "Send" emails the client a link to /proposal/<id>.
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

  return (
    <div id="builder">
      <div className="bhead">
        <div className="bwrap">
          <p className="back">
            <Link href="/admin">All proposals</Link>
          </p>
          <h1>Revelrita proposal builder</h1>
          <p>Fill this in, preview it, send it. It saves as you type, and nothing goes to the client until you hit Send.</p>
        </div>
      </div>

      <div className="bwrap">
        <div className={`setup${sent ? " done" : ""}`}>
          {sent ? (
            <>
              <h2>Sent</h2>
              <p>
                {meta.sentTo ? `Emailed to ${meta.sentTo}` : "Marked as sent"}
                {meta.sentAt ? ` on ${day(meta.sentAt)}` : ""}. Changes you make here show up on their page as they save.
              </p>
              <p>
                <a href={link} target="_blank" rel="noreferrer">
                  Open their page
                </a>
              </p>
            </>
          ) : (
            <>
              <h2>Draft</h2>
              <p>
                {proposal.inquiry
                  ? `Made from the inquiry ${proposal.inquiry.answers[0]?.[1] || "someone"} sent on ${day(proposal.inquiry.receivedAt)}. `
                  : ""}
                Fill in the rest, preview it, and hit <strong>Send to client</strong> when it&apos;s right.
              </p>
            </>
          )}
          {answers.length > 0 && (
            <details className="inquiry" open={!sent}>
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
        </div>

        <fieldset>
          <legend>The event</legend>
          <div className="grid">
            <Stack label="Who it's for" htmlFor="f_name">
              <input {...bind("name")} placeholder="Sarah + Mike" />
            </Stack>
            <Stack label="Event type (sets the colors)" htmlFor="f_eventType">
              <select
                id="f_eventType"
                value={content.eventType}
                onChange={(e) => change({ eventType: e.target.value as EventType })}
              >
                {eventTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Stack>
            <Stack label="Occasion" htmlFor="f_occasion">
              <input {...bind("occasion")} placeholder="Wedding reception" />
            </Stack>
            <Stack label="Date" htmlFor="f_date">
              <input {...bind("date")} placeholder="Saturday, June 13" />
            </Stack>
            <Stack label="Venue or location" htmlFor="f_venue">
              <input {...bind("venue")} placeholder="Private home, Leucadia" />
            </Stack>
            <Stack label="Guest count" htmlFor="f_guests">
              <input {...bind("guests")} placeholder="85 guests" />
            </Stack>
            <Stack label="Service window" htmlFor="f_serviceWindow">
              <input {...bind("serviceWindow")} placeholder="4 hours, 5:00 to 9:00" />
            </Stack>
            <Stack label="Their email (where Send goes)" htmlFor="f_clientEmail">
              <input
                id="f_clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => {
                  dirty.current = true;
                  setSaveState("unsaved");
                  setClientEmail(e.target.value);
                }}
                placeholder="sarah@email.com"
              />
            </Stack>
          </div>
          <Stack
            label="Opening note"
            htmlFor="f_intro"
            hint="Two or three sentences, the way you'd write it in a text."
          >
            <textarea
              {...bind("intro")}
              rows={3}
              placeholder="So glad you reached out. Here's what I'm picturing for your day."
            />
          </Stack>
        </fieldset>

        <fieldset>
          <legend>What they get</legend>
          <Stack label="Package name" htmlFor="f_packageName">
            <input {...bind("packageName")} placeholder="The Coastal Cart" />
          </Stack>
          <Stack label="Included, one per line" htmlFor="f_included">
            <textarea {...bind("included")} rows={9} />
          </Stack>
        </fieldset>

        <fieldset>
          <legend>The opening statement</legend>
          <Stack label="Headline" htmlFor="f_visionTitle">
            <input {...bind("visionTitle")} placeholder="We bring the party, minus the logistics." />
          </Stack>
          <Stack label="A short paragraph. Leave empty to skip this slide." htmlFor="f_visionBody">
            <textarea {...bind("visionBody")} rows={4} />
          </Stack>
        </fieldset>

        <fieldset>
          <legend>What makes Revelrita different</legend>
          <Stack
            label="One per line: short title, pipe, one sentence. Leave empty to skip this slide."
            htmlFor="f_different"
          >
            <textarea {...bind("different")} rows={5} />
          </Stack>
        </fieldset>

        <fieldset>
          <legend>Questions people ask</legend>
          <Stack label="One per line: question, pipe, answer. Leave empty to skip this slide." htmlFor="f_faq">
            <textarea {...bind("faq")} rows={6} />
          </Stack>
        </fieldset>

        <fieldset>
          <legend>Client quote</legend>
          <Stack label="What they said. Leave empty to skip this slide." htmlFor="f_quote">
            <textarea {...bind("quote")} rows={5} />
          </Stack>
          <Stack label="Who said it" htmlFor="f_quoteBy">
            <input {...bind("quoteBy")} placeholder="Jess, backyard 40th in Encinitas" />
          </Stack>
        </fieldset>

        <fieldset>
          <legend>Photos</legend>
          <p className="hint" style={{ margin: "0 0 12px" }}>
            Tick the ones you want in this proposal.
          </p>
          {photoKeys.map((k) => (
            <label className="check" key={k}>
              <input
                type="checkbox"
                checked={content.photos.includes(k)}
                onChange={(e) =>
                  change({
                    photos: e.target.checked ? [...content.photos, k] : content.photos.filter((p) => p !== k),
                  })
                }
              />{" "}
              {photoLabels[k]}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>The menu</legend>
          <Stack label="Menu heading" htmlFor="f_menuTitle">
            <input {...bind("menuTitle")} placeholder="Two signature drinks, beer and wine" />
          </Stack>
          <Stack
            label="One drink per line: name, then a pipe, then ingredients"
            htmlFor="f_menu"
            hint="Names and ingredients only, no descriptions. Leave this empty to hide the menu until the menu's built."
          >
            <textarea
              {...bind("menu")}
              rows={6}
              placeholder="Passion Fruit Marg | tequila blanco, passion fruit, lime, agave"
            />
          </Stack>
        </fieldset>

        <fieldset>
          <legend>Pricing</legend>
          <div className="stack">
            <label>What you&apos;re charging</label>
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
                    placeholder="Bar cart and two bartenders, 4 hours"
                    value={row.label}
                    onChange={(e) => setRow(i, { label: e.target.value })}
                  />
                  <input
                    className="pr-a"
                    aria-label="Amount"
                    placeholder="850"
                    value={row.amount}
                    onChange={(e) => setRow(i, { amount: e.target.value })}
                  />
                  <input
                    className="pr-n"
                    aria-label="Note"
                    placeholder=""
                    value={row.note}
                    onChange={(e) => setRow(i, { note: e.target.value })}
                  />
                  <button type="button" className="pr-x" aria-label="Remove this line" onClick={() => removeRow(i)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="linkbtn"
              style={{ marginLeft: 0 }}
              onClick={() => change({ pricing: [...content.pricing, emptyRow()] })}
            >
              Add another line
            </button>
            <p className="hint">
              Amounts get added up for you. You can also write &quot;Included&quot; or &quot;TBD&quot; and it shows
              as-is.
            </p>
          </div>
          <div className="grid">
            <Stack label="Deposit line" htmlFor="f_deposit">
              <input {...bind("deposit")} placeholder="$200 deposit holds the date" />
            </Stack>
            <Stack label="Good through" htmlFor="f_holdsFor">
              <input {...bind("holdsFor")} placeholder="This quote holds for 7 days" />
            </Stack>
          </div>
          <Stack label="Peak date line (leave empty if it's not one)" htmlFor="f_peak">
            <input {...bind("peak")} placeholder="This is a peak Saturday, and peak dates are priced accordingly." />
          </Stack>
          <Stack
            label="What's in the number. One per line: short title, pipe, one sentence. Empty to skip."
            htmlFor="f_inTheNumber"
          >
            <textarea {...bind("inTheNumber")} rows={6} />
          </Stack>
          <Stack label="Pricing note" htmlFor="f_pricingNote">
            <input {...bind("pricingNote")} placeholder="Final count confirmed two weeks out" />
          </Stack>
        </fieldset>

        <fieldset>
          <legend>The alcohol</legend>
          <Stack
            label="How the two payments work"
            htmlFor="f_alcohol"
            hint={
              <>
                Edit it if this event&apos;s different.
                <button
                  type="button"
                  className="linkbtn"
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
          </Stack>
        </fieldset>

        <fieldset>
          <legend>Next steps and contact</legend>
          <Stack label="Steps, one per line" htmlFor="f_steps">
            <textarea {...bind("steps")} rows={4} />
          </Stack>
          <div className="grid">
            <Stack label="Email" htmlFor="f_email">
              <input {...bind("email")} />
            </Stack>
            <Stack label="Phone" htmlFor="f_phone">
              <input {...bind("phone")} />
            </Stack>
          </div>
          <Stack label="Sign-off" htmlFor="f_signOff">
            <input {...bind("signOff")} placeholder="Can't wait. Let's make it a party." />
          </Stack>
        </fieldset>

        <p className="hint">
          <button type="button" className="linkbtn" style={{ marginLeft: 0 }} onClick={onDelete}>
            Delete this proposal
          </button>
        </p>
      </div>

      <div className="bar noprint">
        <button type="button" className="btn ghost" onClick={showPreview}>
          Preview
        </button>
        <button type="button" className="btn" onClick={() => setSending(true)}>
          {sent ? "Send again" : "Send to client"}
        </button>
        <div className="grow">
          <input
            readOnly
            aria-label="Their link"
            style={{ opacity: 0.75 }}
            value={sent ? link : "Their link goes live when you send it."}
          />
        </div>
        {sent && (
          <button type="button" className="btn ghost" onClick={copyLink}>
            Copy client link
          </button>
        )}
        <button type="button" className="btn ghost" onClick={() => save(content, clientEmail)} disabled={saveState === "saving"}>
          {saveState === "saving"
            ? "Saving..."
            : saveState === "saved"
              ? "Saved"
              : saveState === "error"
                ? "Not saved, retry"
                : "Save"}
        </button>
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

/** A labelled field, the artifact's .stack */
function Stack({
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
    <div className="stack">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="hint">{hint}</p>}
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
        <Stack label="To" htmlFor="s_to">
          <input id="s_to" type="email" required value={to} onChange={(e) => setTo(e.target.value)} autoFocus />
        </Stack>
        <Stack label="Subject" htmlFor="s_subject">
          <input id="s_subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Stack>
        <Stack
          label="Message"
          htmlFor="s_message"
          hint="They get this with a button to their proposal. It comes from fun@revelrita.com, so replies land in your inbox."
        >
          <textarea id="s_message" rows={9} value={message} onChange={(e) => setMessage(e.target.value)} />
        </Stack>
        <div className="cta-row">
          <button type="submit" className="btn" disabled={busy}>
            {busy ? "Sending..." : "Send it"}
          </button>
          <button type="button" className="btn ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
        </div>
        <p className="hint">
          Rather text or DM it yourself?
          <button type="button" className="linkbtn" disabled={busy} onClick={() => run(() => onCopyInstead(to.trim()))}>
            Mark it sent and copy the link
          </button>
        </p>
      </form>
    </div>
  );
}
