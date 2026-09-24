"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Fades `.reveal` elements in as they scroll into view. Watches the DOM so it
 * also picks up elements rendered by client-side navigation.
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );
    const watch = (root: ParentNode) =>
      root.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
    watch(document);

    const mo = new MutationObserver((records) => {
      records.forEach((r) =>
        r.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.matches(".reveal:not(.in)")) io.observe(n);
          watch(n);
        }),
      );
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  // Fail open: never leave content near the top invisible if the observer misbehaves
  useEffect(() => {
    const t = setTimeout(() => {
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 1.2) el.classList.add("in");
      });
    }, 1200);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
