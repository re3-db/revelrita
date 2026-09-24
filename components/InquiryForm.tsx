"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { sendInquiry, type InquiryResult } from "@/app/actions";
import { delay } from "@/lib/site";

type Variant = "home" | "book";

const drinkChoices = (variant: Variant) => [
  { value: "beer-wine", label: "Beer and wine" },
  {
    value: "beer-wine-cocktails",
    label: variant === "home" ? "Beer, wine and a couple of cocktails" : "Beer, wine and cocktails",
  },
  { value: "mocktails", label: "Mocktails only" },
  { value: "unsure", label: "No idea, help me decide!" },
];

/**
 * The "Check your date" inquiry form. The home page shows a shorter version on
 * a sky card; /book adds placeholders and an event-type field.
 */
export default function InquiryForm({ variant }: { variant: Variant }) {
  const book = variant === "book";
  const [result, setResult] = useState<InquiryResult | null>(null);
  const [pending, startTransition] = useTransition();
  const note = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (book && result) note.current?.scrollIntoView({ block: "nearest" });
  }, [book, result]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      let res: InquiryResult;
      try {
        res = await sendInquiry(data);
      } catch {
        res = { ok: false, message: "Something went wrong sending that. Email fun@revelrita.com and we'll get right back to you." };
      }
      setResult(res);
      if (res.ok) form.reset();
    });
  }

  // The book page wraps each input in .field; the home page doesn't
  const fieldClass = book ? "field" : undefined;

  return (
    <form
      className={`card reveal ${book ? "bg-paper" : "bg-sky"}`}
      style={delay(120)}
      onSubmit={onSubmit}
    >
      <input type="hidden" name="source" value={book ? "Book page" : "Home page"} />
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor={`${variant}-company`}>Company</label>
        <input id={`${variant}-company`} name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="form-grid">
        <div className={fieldClass}>
          <label htmlFor={`${variant}-name`}>Your name</label>
          <input id={`${variant}-name`} name="name" autoComplete="name" placeholder={book ? "Helen Smith" : undefined} />
        </div>
        <div className={fieldClass}>
          <label htmlFor={`${variant}-email`}>Email</label>
          <input
            id={`${variant}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder={book ? "you@email.com" : undefined}
          />
        </div>
        <div className={fieldClass}>
          <label htmlFor={`${variant}-date`}>Event date</label>
          <input id={`${variant}-date`} name="date" placeholder={book ? "June 14, or still deciding" : undefined} />
        </div>
        <div className={fieldClass}>
          <label htmlFor={`${variant}-guests`}>Guest count</label>
          <input
            id={`${variant}-guests`}
            name="guests"
            inputMode="numeric"
            placeholder={book ? "Roughly is fine" : undefined}
          />
        </div>
      </div>

      {book && (
        <div className="field">
          <label htmlFor="book-kind">What kind of event is it?</label>
          <input id="book-kind" name="kind" placeholder="Wedding, birthday, work party, something else" />
        </div>
      )}

      <div className={book ? "field" : "mt-[18px]"}>
        <label>What are you thinking for drinks?</label>
        <div className="choices">
          {drinkChoices(variant).map((c) => (
            <label className="choice" key={c.value}>
              <input type="radio" name="drinks" value={c.value} />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={book ? "field" : "mt-[18px]"}>
        <label htmlFor={`${variant}-vibe`}>
          {book ? "Where is it, and what's the vibe?" : "Venue, and the vibe you're going for"}
        </label>
        <textarea
          id={`${variant}-vibe`}
          name="vibe"
          rows={book ? 4 : 3}
          placeholder={
            book ? "Venue or neighborhood, what you're celebrating, anything you already know you want." : undefined
          }
        />
      </div>

      <button
        className={`btn w-full ${book ? "h-[60px] text-[18px]" : "mt-[20px]"}`}
        type="submit"
        disabled={pending}
      >
        {pending ? "Sending..." : "Send it over"}
      </button>
      <p
        ref={note}
        className={`note font-sans text-[15px] font-semibold ${book ? "mt-[16px]" : "mt-[14px]"}`}
        role="status"
        hidden={!result?.message}
      >
        {result?.message}
      </p>
    </form>
  );
}
