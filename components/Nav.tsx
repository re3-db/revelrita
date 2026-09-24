"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoBlue } from "@/lib/images";
import { contact, pages } from "@/lib/site";

const centerLinks = [
  { href: "/events", label: "Events" },
  { href: "/packages", label: "Packages" },
  { href: "/gallery", label: "Gallery" },
];

export default function Nav() {
  const pathname = usePathname();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);

  // Cream background + shadow once the page scrolls past the top
  useEffect(() => {
    let ticking = false;
    const update = () => {
      setStuck(window.scrollY > 40);
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

  // Full-screen menu locks page scroll and closes on Escape
  useEffect(() => {
    document.body.classList.toggle("locked", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <div className={`nav${stuck ? " stuck" : ""}`} id="nav">
        <Link href="/" aria-label="Revelrita home">
          <Image src={logoBlue} alt="Revelrita" sizes="150px" preload />
        </Link>
        <nav>
          {centerLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname === l.href ? "active" : undefined}
              aria-current={pathname === l.href ? "page" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="navright">
          <Link className="btn sm" href="/book">
            Check your date
          </Link>
          <button
            className="burger"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <div className="menu" id="menu" hidden={!open}>
        <button className="close" aria-label="Close menu" onClick={close}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <nav className="menulinks">
          {pages.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              onClick={close}
              aria-current={pathname === p.href ? "page" : undefined}
            >
              {p.label}
            </Link>
          ))}
        </nav>
        <div className="menufoot">
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
          <a href={contact.phoneHref}>{contact.phone}</a>
          <a href={contact.instagramHref}>{contact.instagram}</a>
        </div>
      </div>
    </>
  );
}
