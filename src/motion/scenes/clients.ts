import { MOTION_OK_QUERY } from "../level";
import { register, type Kit } from "../load";

/**
 * Stack de clientes (DISENO-v2 §8.2). Las tarjetas ya son sticky en CSS; aquí
 * solo se hunde la anterior cuando llega la siguiente, entra el texto, la media
 * hace parallax dentro de su marco y el recorrido corre mientras la tarjeta está activa.
 */
export function mount(root: HTMLElement, { gsap, ScrollTrigger, debug }: Kit): () => void {
  const cards = Array.from(root.querySelectorAll<HTMLElement>(".client-card"));
  if (!cards.length) return () => {};
  const mm = gsap.matchMedia(root);
  let unregister = () => {};

  mm.add(`${MOTION_OK_QUERY} and (prefers-reduced-motion: no-preference)`, (ctx) => {
    const header = () =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 56;
    const top = () => header() + 16;
    // Las tarjetas son sticky: su offsetTop y su rect dan la posición PEGADA si
    // se miden con una tarjeta pegada, y los tramos quedaban corridos (el
    // recorrido se pausaba solo, QA). La posición de flujo se suma desde la pila,
    // que no es sticky.
    const stack = cards[0].parentElement as HTMLElement;
    const abs = (el: HTMLElement) => {
      let y = 0;
      for (let e: HTMLElement | null = el; e; e = e.offsetParent as HTMLElement | null) y += e.offsetTop;
      return y;
    };
    const nt = (el: HTMLElement) => {
      let y = abs(stack);
      for (const c of cards) {
        y += parseFloat(getComputedStyle(c).marginTop) || 0;
        if (c === el) return y;
        y += c.offsetHeight;
      }
      return y;
    };

    // Una tarjeta más alta que la ventana no se apila: se leería cortada.
    const fit = () =>
      cards.forEach((c) => {
        c.removeAttribute("data-stack");
        if (c.offsetHeight > window.innerHeight - top()) c.setAttribute("data-stack", "off");
      });
    ScrollTrigger.addEventListener("refreshInit", fit);

    const triggers: ReturnType<typeof ScrollTrigger.create>[] = [];
    // Montaje troceado (re-QA: 52–60 ms de long task con CPU 4×): las medidas
    // en un frame y los triggers de cada tarjeta en el siguiente. ctx.add los
    // registra en el contexto de matchMedia, así el revert los alcanza igual.
    const build = (card: HTMLElement, i: number) => {
      const next = cards[i + 1];
      const stacked = card.dataset.stack !== "off";

      // La tarjeta i se hunde bajo la que llega (la última no).
      if (next && stacked) {
        const tw = gsap.fromTo(
          card,
          { scale: 1, yPercent: 0, "--veil": 0 },
          {
            scale: 0.94,
            yPercent: -3,
            "--veil": 0.55,
            ease: "none",
            transformOrigin: "50% 0",
            scrollTrigger: {
              trigger: next,
              start: () => nt(next) - window.innerHeight,
              end: () => nt(next) - top(),
              scrub: true,
              markers: debug,
              invalidateOnRefresh: true,
            },
          },
        );
        if (tw.scrollTrigger) triggers.push(tw.scrollTrigger);
      }

      // Entra el texto (una vez).
      const texts = Array.from(card.querySelectorAll<HTMLElement>(".client-card__text > *"));
      gsap.from(texts, {
        y: 16,
        opacity: 0,
        duration: 0.6,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: { trigger: card, start: () => nt(card) - window.innerHeight * 0.7, once: true },
      });

      // Parallax de la media dentro de su marco (recorte intencional: data-overflow-ok).
      const media = card.querySelectorAll(".frame__img, .frame__video");
      gsap.set(media, { scale: 1.1 });
      gsap.fromTo(
        media,
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: () => nt(card) - window.innerHeight,
            end: () => nt(card) + card.offsetHeight,
            scrub: true,
          },
        },
      );
      // El teléfono flota (±24 px: con 40 salía del marco, que lo recorta abajo).
      const phone = card.querySelector(".frame__inset");
      if (phone)
        gsap.fromTo(
          phone,
          { y: 24 },
          {
            y: -24,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: () => nt(card) - window.innerHeight,
              end: () => nt(card) + card.offsetHeight,
              scrub: true,
            },
          },
        );

      // Recorrido en loop solo mientras la tarjeta está activa.
      const frame = card.querySelector(".frame");
      if (frame && card.querySelector("video")) {
        ScrollTrigger.create({
          trigger: card,
          start: () => nt(card) - window.innerHeight * 0.7,
          end: () => (next ? nt(next) - top() : nt(card) + card.offsetHeight),
          onToggle: (self) => frame.dispatchEvent(new Event(self.isActive ? "media:play" : "media:pause")),
        });
      }
    };
    const rafs: number[] = [];
    let k = 0;
    const step = () => {
      if (k >= cards.length) return;
      const i = k++;
      ctx.add(() => build(cards[i], i));
      rafs.push(requestAnimationFrame(step));
    };
    rafs.push(
      requestAnimationFrame(() => {
        fit();
        rafs.push(requestAnimationFrame(step));
      }),
    );

    unregister = register(debug, "clients", {
      triggers,
      progress: (n: number) => {
        const a = root.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: a + n * root.offsetHeight, behavior: "instant" });
      },
    });

    return () => {
      rafs.forEach(cancelAnimationFrame);
      ScrollTrigger.removeEventListener("refreshInit", fit);
      cards.forEach((c) => {
        c.removeAttribute("data-stack");
        c.querySelector(".frame")?.dispatchEvent(new Event("media:pause"));
      });
      unregister();
    };
  });

  return () => mm.revert();
}
