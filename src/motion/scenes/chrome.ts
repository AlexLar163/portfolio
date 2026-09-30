import { MOTION_OK_QUERY } from "../level";
import type { Kit } from "../load";

/**
 * Piezas de toda la página (DISENO-v2 §4.3 y §11 #4, #6): salida del hero con
 * el scroll, hairline de progreso bajo el header y CTAs magnéticos del hero.
 */
export function mount(root: HTMLElement, { gsap }: Kit): () => void {
  const mm = gsap.matchMedia(root);

  mm.add(`${MOTION_OK_QUERY} and (prefers-reduced-motion: no-preference)`, () => {
    const hero = document.getElementById("inicio");
    const main = hero?.querySelector(".hero__main");
    const index = hero?.querySelector(".hero__index");
    if (hero && main && index) {
      const scrub = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
      gsap.to(main, { yPercent: -10, opacity: 0.25, ease: "none", scrollTrigger: scrub });
      gsap.to(index, { y: -48, ease: "none", scrollTrigger: { ...scrub } });
    }

    const bar = document.querySelector(".read-progress");
    if (bar) {
      gsap.set(bar, { opacity: 1 });
      gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: true },
        },
      );
    }

    // Magnético: (cursor − centro) × .25, con tope de ±6 px; vuelve a 0 sin elastic.
    const offs: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>(".magnetic").forEach((el) => {
      const toX = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
      const toY = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
      const clamp = gsap.utils.clamp(-6, 6);
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        toX(clamp((e.clientX - (r.left + r.width / 2)) * 0.25));
        toY(clamp((e.clientY - (r.top + r.height / 2)) * 0.25));
      };
      const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.35, ease: "power3.out" });
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      offs.push(() => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      });
    });

    return () => offs.forEach((f) => f());
  });

  return () => mm.revert();
}
