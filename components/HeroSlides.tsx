"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef, useState } from "react";

type Slide = { src: StaticImageData; alt: string };

/** The arched home-page photo: crossfades every 5s with a slight scroll parallax. */
export default function HeroSlides({ slides }: { slides: Slide[] }) {
  const bg = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!document.hidden) setActive((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hero = bg.current?.closest(".hero") as HTMLElement | null;
    let ticking = false;
    const update = () => {
      const y = window.scrollY || 0;
      if (bg.current && hero && y < hero.offsetHeight) {
        bg.current.style.transform = `translate3d(0,${y * 0.04}px,0)`;
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="frame">
      <div className="bg" ref={bg}>
        {slides.map((s, i) => (
          <Image
            key={s.alt}
            className={`slide${i === active ? " on" : ""}`}
            src={s.src}
            alt={s.alt}
            aria-hidden={i === 0 ? undefined : true}
            sizes="(max-width: 1000px) 460px, 620px"
            preload={i === 0}
          />
        ))}
      </div>
    </div>
  );
}
