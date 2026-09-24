"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Stars from "@/components/Stars";
import { reviews } from "@/lib/reviews";

/** Must match the .review flex-basis breakpoints in globals.css */
function perPage() {
  return window.innerWidth <= 640 ? 1 : window.innerWidth <= 1000 ? 2 : 3;
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
              <blockquote>{r.quote}</blockquote>
              <figcaption>{r.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="rev-nav">
        <div className="dots">
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
