/**
 * Motion liviano sin GSAP (DISENO-v2 §7.3). Un solo módulo, un observer por tipo:
 *
 *   [data-inview]  → .in-view mientras está en pantalla (pausa paquetes y marquee afuera)
 *   [data-reveal]  → .is-in una sola vez (bento, carriles). El estado oculto solo
 *                    existe mientras <html> tiene .reveal-on, que pone este módulo:
 *                    sin JS, o si esto no corre, no queda nada invisible.
 *   .marquee__row  → la duración sale del ancho real a velocidad fija (px/s): si
 *                    se suman portadas, la cinta no acelera.
 *   .spot          → un único pointermove delegado escribe --mx/--my en el elemento,
 *                    desde el bucle rAF compartido.
 */
import { addTask, wake } from "../engine";

const MARQUEE_PX_PER_S = 30;

export function mountObserve(): () => void {
  const html = document.documentElement;
  const offs: (() => void)[] = [];

  const inview = new IntersectionObserver((entries) => {
    for (const e of entries) e.target.classList.toggle("in-view", e.isIntersecting);
  });
  document.querySelectorAll("[data-inview]").forEach((el) => inview.observe(el));
  offs.push(() => inview.disconnect());

  html.classList.add("reveal-on");
  const reveal = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        // Lo que ya quedó arriba (se llegó por un ancla) se da por visto.
        if (e.isIntersecting || e.boundingClientRect.bottom < 0) {
          e.target.classList.add("is-in");
          reveal.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -20% 0px" },
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));
  offs.push(() => {
    reveal.disconnect();
    html.classList.remove("reveal-on");
  });

  const sizeMarquee = () =>
    document.querySelectorAll<HTMLElement>(".marquee__row").forEach((row) => {
      const track = row.firstElementChild as HTMLElement | null;
      if (track) row.style.setProperty("--marquee-d", `${track.offsetWidth / MARQUEE_PX_PER_S}s`);
    });
  sizeMarquee();
  const ro = new ResizeObserver(sizeMarquee);
  document.querySelectorAll(".marquee__track").forEach((t) => ro.observe(t));
  offs.push(() => ro.disconnect());

  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    // Pinta en el bucle compartido (engine.ts): un evento pendiente por frame.
    let last: PointerEvent | null = null;
    const paint = () => {
      const e = last;
      last = null;
      const el = e && (e.target as Element | null)?.closest?.<HTMLElement>(".spot");
      if (!e || !el) return false;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
      return false;
    };
    const offTask = addTask(paint);
    const onMove = (e: PointerEvent) => {
      last = e;
      wake();
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    offs.push(() => {
      document.removeEventListener("pointermove", onMove);
      offTask();
    });
  }

  return () => offs.forEach((f) => f());
}
