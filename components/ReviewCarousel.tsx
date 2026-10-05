"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Stars from "@/components/Stars";
import { reviews } from "@/lib/reviews";

/** Must match the .review flex-basis breakpoints in globals.css */
function perPage() {
  return window.innerWidth <= 640 ? 1 : window.innerWidth <= 1000 ? 2 : 3;
}

/** A review quote clamped to 8 lines, with a "Read more" toggle when it overflows. */
function Quote({ text }: { text: string }) {
  const ref = useRef<HTMLQuoteElement>(null);
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex-1">
      <blockquote ref={ref} className={open ? undefined : "line-clamp-8"}>
        {text}
      </blockquote>
      {(open || clamped) && (
        <button
          className="mt-[10px] p-0 border-0 bg-transparent cursor-pointer font-sans text-[14px] font-semibold text-ink underline underline-offset-4"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

/** The scroll-snapping reviews strip on the home page, with dots and arrows. */
export default function ReviewCarousel() {
  const track = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(Math.ceil(reviews.length / 3));
  const [current, setCurrent] = useState(0);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setPageCount(Math.max(1, Math.ceil(reviews.length / perPage())));
    setCurrent(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(t);
      t = setTimeout(measure, 90);
    };
    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const goTo = (page: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: page * el.clientWidth, behavior: "smooth" });
  };

  const step = (dir: number) => {
    const el = track.current;
    if (!el) return;
    // Read the live position, not state: state lags behind a smooth scroll in progress
    let next = Math.round(el.scrollLeft / Math.max(1, el.clientWidth)) + dir;
    if (next < 0) next = pageCount - 1;
    if (next > pageCount - 1) next = 0;
    goTo(next);
  };

  return (
    <>
      <div className="viewport">
        <div className="track" ref={track}>
          {reviews.map((r) => (
            <figure className="review" key={r.name}>
              <Stars />
              <Quote text={r.quote} />
              <figcaption>{r.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="rev-nav">
        {/* A dot per review won't fit beside the arrows on a phone, so phones get a counter */}
        <p className="hidden max-[641px]:block m-0 font-sans text-[14px] font-semibold text-ink">
          {current + 1} / {pageCount}
        </p>
        <div className="dots max-[641px]:hidden">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              className={`dot${i === current ? " on" : ""}`}
              aria-label={`Reviews page ${i + 1}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <div className="arrows">
          <button className="arrow" aria-label="Previous reviews" onClick={() => step(-1)}>
            <svg viewBox="0 0 24 24">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button className="arrow" aria-label="More reviews" onClick={() => step(1)}>
            <svg viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
