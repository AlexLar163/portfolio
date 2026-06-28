"use client";

import { useEffect } from "react";

const SELECTOR =
  ".ed-section > h2, .ed-group, .ed-skillcard, .ed-project, .ed-exp, .ed .ghcal, .ed-ghstats, .ed-contact > div";

/**
 * Adds scroll-reveal animations to the editorial layout. Marks the root so the
 * "hidden" state only applies when JS runs (no-JS / crawlers see content), and
 * bails out entirely under prefers-reduced-motion.
 */
export function EditorialReveals() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".ed");
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    root.classList.add("ed-reveal-on");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }),
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    // Anything already in (or scrolled above) the viewport reveals immediately,
    // so content is never left stuck at opacity:0 — only below-the-fold items
    // get the scroll-in animation.
    root.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add("in");
      } else {
        io.observe(el);
      }
    });
    return () => io.disconnect();
  }, []);

  return null;
}
