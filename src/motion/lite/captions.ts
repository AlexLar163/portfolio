/**
 * Caption sticky del diagrama vertical (DISENO-v2 §5.6), sin GSAP.
 * Cada centinela cubre el tramo del diagrama entre su nodo y el siguiente; el que
 * cruza la línea media de la ventana decide qué paso se ve.
 */
export function mountCaptions(stage: HTMLElement): () => void {
  const items = Array.from(stage.querySelectorAll<HTMLElement>(".stage-steps > li"));
  const sentinels = Array.from(stage.querySelectorAll<HTMLElement>("[data-sentinel]"));
  if (!items.length || !sentinels.length) return () => {};

  const activate = (i: number) =>
    items.forEach((li, k) => li.toggleAttribute("data-active", k === i));

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) activate(Number((e.target as HTMLElement).dataset.sentinel));
      }
    },
    { rootMargin: "-50% 0px -50% 0px" },
  );
  sentinels.forEach((s) => io.observe(s));
  return () => {
    io.disconnect();
    activate(0);
  };
}
