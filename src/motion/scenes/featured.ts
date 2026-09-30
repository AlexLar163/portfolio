import { MOTION_OK_QUERY } from "../level";
import { register, type Kit } from "../load";

/**
 * Destacados en desktop (DISENO-v2 §9.3). Qué paso está activo lo decide
 * FeatureBody (un IntersectionObserver en la franja 45–55 %, el mismo criterio que
 * `start:"top 55%"`); aquí van la máscara del nombre y el progreso por paso con
 * scrub. El barrido de capas, el teléfono y la grilla de Vera son CSS.
 */
export function mount(root: HTMLElement, { gsap, debug }: Kit): () => void {
  const features = Array.from(root.querySelectorAll<HTMLElement>(".feature"));
  if (!features.length) return () => {};
  const mm = gsap.matchMedia(root);
  let unregister = () => {};

  mm.add(`${MOTION_OK_QUERY} and (prefers-reduced-motion: no-preference)`, () => {
    features.forEach((f) => {
      f.classList.add("is-scene");
      const head = f.querySelector(".feature__head");
      const name = f.querySelector(".mask__inner");
      const rest = f.querySelectorAll(".feature__meta, .feature__line");
      if (head && name) {
        const tl = gsap.timeline({ scrollTrigger: { trigger: head, start: "top 80%", once: true } });
        tl.from(name, { yPercent: 100, duration: 0.7, ease: "expo.out" }).from(
          rest,
          { opacity: 0, duration: 0.5, ease: "expo.out" },
          0.15,
        );
      }

      // Progreso por paso en la base del stage.
      const steps = Array.from(f.querySelectorAll<HTMLElement>(".feature__steps > li"));
      const segs = Array.from(f.querySelectorAll<HTMLElement>(".feature__progress i"));
      steps.forEach((li, i) => {
        if (!segs[i]) return;
        gsap.fromTo(
          segs[i],
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: li, start: "top 55%", end: "bottom 55%", scrub: true, markers: debug },
          },
        );
      });
    });

    unregister = register(debug, "featured", {
      progress: (n: number) => {
        const a = root.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: a + n * root.offsetHeight, behavior: "instant" });
      },
    });

    return () => {
      features.forEach((f) => f.classList.remove("is-scene"));
      unregister();
    };
  });

  return () => mm.revert();
}
