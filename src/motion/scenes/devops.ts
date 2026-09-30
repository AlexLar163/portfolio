import { MOTION_OK_QUERY } from "../level";
import { register, type Kit } from "../load";

/**
 * Escena DevOps «una petición de punta a punta» (DISENO-v2 §5.3).
 *
 * El stage es sticky en CSS (el alto ya está reservado): GSAP solo LEE el
 * progreso del scroll. Lo continuo (dibujar, aparecer, encoger) va en tweens del
 * timeline; lo discreto (qué nodo se enciende, qué paso se lee, qué chip corre)
 * se DERIVA del tiempo del timeline en cada update, así es reversible sin
 * callbacks que dependan del sentido del scroll.
 */

const T = 10; // duración del timeline, en unidades

/** Qué paso se lee en cada tramo. */
const CAPTIONS: [string, number, number][] = [
  ["visit", 2.2, 2.9],
  ["proxy", 2.9, 3.3],
  ["container", 3.3, 3.6],
  ["webhook", 3.6, 5.0],
  ["deploy", 5.0, 6.6],
  ["ops", 6.6, 8.4],
];

/** Nodos encendidos: [id, desde, hasta]. */
const LIT: [string, number, number][] = [
  ["visitors", 2.3, 3.6],
  ["dns", 2.6, 3.6],
  ["caddy", 2.9, 3.6],
  ["wordpress", 3.2, 3.6],
  ["mariadb", 3.4, 3.6],
  ["telegram", 3.7, 5.0],
  ["caddy", 4.0, 5.0],
  ["n8n", 4.3, 5.0],
  ["runner", 4.6, 5.0],
  ["github", 5.0, 6.6],
  ["host", 5.4, 6.6],
  ["cron", 6.6, 8.0],
  ["n8n", 6.8, 8.0],
  ["backups", 6.9, 8.0],
  ["mariadb", 7.1, 8.0],
];

/** Chips del carril de CI: se encienden en orden; el anterior queda hecho. */
const CHIPS = [5.2, 5.5, 5.8, 6.1];
const CHIPS_END = 8.0;

const GROUPS: [string, number][] = [
  ["external", 1.2],
  ["dns", 1.4],
  ["vps", 1.6],
  ["caddy", 1.6],
  ["docker", 1.8],
  ["cloud", 2.0],
];

export function mount(root: HTMLElement, { gsap, ScrollTrigger, debug }: Kit): () => void {
  const scene = root.querySelector<HTMLElement>(".devops-scene");
  const stage = root.querySelector<HTMLElement>(".devops-stage");
  const svg = root.querySelector<SVGSVGElement>(".dg-wrap--land svg");
  if (!scene || !stage || !svg) return () => {};

  const mm = gsap.matchMedia(root);
  let unregister = () => {};

  mm.add(`${MOTION_OK_QUERY} and (prefers-reduced-motion: no-preference)`, () => {
    const q = <E extends Element = HTMLElement>(sel: string, el: ParentNode = stage) =>
      Array.from(el.querySelectorAll<E>(sel));
    const title = stage.querySelector<HTMLElement>(".stage-title")!;
    const words = q(".stage-lead .w");
    const steps = q<HTMLLIElement>(".stage-steps > li");
    const chips = q(".chips--ci .chip");
    const traffic = q<SVGPathElement>('.edge--traffic', svg);
    const softEdges = q<SVGPathElement>(".edge--control, .edge--scheduled", svg).filter(
      (e) => !["e11", "e12", "e13"].includes(e.dataset.edge ?? ""),
    );
    const mask = (id: string) => svg.querySelector<SVGPathElement>(`[data-edge-mask="${id}"]`);
    const route = (id: string) => svg.querySelector<SVGPathElement>(`[data-route="${id}"]`)!;
    const label = (id: string) => svg.querySelector(`[data-edge-label="${id}"]`);

    stage.classList.add("is-scene");
    // Alto de la fila del título = el título encogido (transform no cambia el layout).
    const measure = () => stage.style.setProperty("--title-h", `${title.offsetHeight * 0.62}px`);
    measure();
    ScrollTrigger.addEventListener("refreshInit", measure);

    // ── Estados iniciales: solo desde JS (sin JS no queda nada oculto) ──
    gsap.set(words, { opacity: 0.15 });
    gsap.set(q("[data-frame]", svg), { strokeDasharray: "1 1", strokeDashoffset: 1, fillOpacity: 0 });
    gsap.set(q("[data-frame-label]", svg), { opacity: 0 });
    gsap.set(q(".node", svg), { opacity: 0, y: 12 });
    gsap.set([...traffic, ...softEdges], { opacity: 0 });
    gsap.set(q("[data-edge-label]", svg), { opacity: 0 });
    gsap.set([mask("e11"), mask("e12"), mask("e13")].filter(Boolean), { strokeDashoffset: 1 });
    gsap.set([route("1"), route("2")], { strokeDashoffset: 1 });
    // Leyenda y pausa del tráfico: entran con el diagrama armado.
    gsap.set(stage.querySelector(".stage-foot__end"), { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "none" } });
    tl.addLabel("intro", 0)
      .to(words, { opacity: 1, duration: 0.12, stagger: 0.88 / Math.max(1, words.length) }, 0)
      .addLabel("armado", 1)
      .to(title, { scale: 0.62, duration: 1.2, ease: "power2.inOut" }, 1)
      .to('[data-frame="vps"]', { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }, 1)
      .to('[data-frame="docker"]', { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, 1.3)
      .to(q("[data-frame]", svg), { fillOpacity: 1, duration: 0.6 }, 1.6)
      .to(q("[data-frame-label]", svg), { opacity: 1, duration: 0.4 }, 1.3);
    for (const [g, at] of GROUPS) {
      const els = q(`.node[data-group="${g}"]`, svg);
      if (els.length) tl.to(els, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.06 }, at);
    }
    tl.to([...traffic, ...softEdges], { opacity: 1, duration: 0.4 }, 1.8)
      .to(stage.querySelector(".stage-foot__end"), { opacity: 1, duration: 0.3 }, 2)
      .addLabel("peticion", 2.2)
      .to(route("1"), { strokeDashoffset: 0, duration: 1.2 }, 2.2)
      .addLabel("webhook", 3.6)
      .to(route("2"), { strokeDashoffset: 0, duration: 1.2 }, 3.6)
      .to(label("e6"), { opacity: 1, duration: 0.2 }, 3.8)
      .to(label("e7"), { opacity: 1, duration: 0.2 }, 4.4)
      .addLabel("deploy", 5)
      .to(mask("e13"), { strokeDashoffset: 0, duration: 1 }, 5)
      .addLabel("ops", 6.6)
      .to(mask("e12"), { strokeDashoffset: 0, duration: 0.8 }, 6.6)
      .to(mask("e11"), { strokeDashoffset: 0, duration: 0.8 }, 6.9)
      .addLabel("vivo", 8)
      // El snap aterriza con el panel ya cruzado (8.4 + .3), no en el umbral.
      .addLabel("final", 8.8)
      .to({}, { duration: T - 8 }, 8); // el estado final se sostiene antes de soltar el sticky

    // ── Estado discreto derivado del tiempo ──
    let lastKey = "";
    const apply = () => {
      const t = tl.time();
      const lit = new Set(LIT.filter(([, a, b]) => t >= a && t < b).map(([id]) => id));
      const cap = CAPTIONS.find(([, a, b]) => t >= a && t < b)?.[0] ?? "";
      const chipState = chips.map((_, i) =>
        t >= CHIPS[i] && t < (CHIPS[i + 1] ?? CHIPS_END) ? "on" : t >= CHIPS[i] ? "done" : "",
      );
      const vivo = t >= 8.4;
      const live = t >= 8.2;
      const r1 = t >= 3.6;
      const r2 = t >= 5;
      const key = [...lit].join() + cap + chipState.join() + vivo + live + r1 + r2;
      if (key === lastKey) return;
      lastKey = key;
      q(".node", svg).forEach((n) => n.classList.toggle("is-lit", lit.has(n.dataset.node ?? "")));
      steps.forEach((li) => li.toggleAttribute("data-active", li.dataset.step === cap));
      chips.forEach((c, i) => {
        c.classList.toggle("is-on", chipState[i] === "on");
        c.classList.toggle("is-done", chipState[i] === "done");
      });
      route("1").classList.toggle("is-rest", r1);
      route("2").classList.toggle("is-rest", r2);
      stage.classList.toggle("is-vivo", vivo);
      stage.classList.toggle("is-live", live);
    };
    tl.eventCallback("onUpdate", apply);

    const header = () =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 56;

    const st = ScrollTrigger.create({
      trigger: scene,
      // El stage se pega bajo el header, no en el tope de la ventana.
      start: () => `top ${header()}px`,
      end: "bottom bottom",
      scrub: 0.6,
      animation: tl,
      invalidateOnRefresh: true,
      markers: debug,
      // ?motion=debug&snap=0 (solo fuera de producción): sin snap, para capturar fases exactas.
      snap: debug && new URLSearchParams(window.location.search).get("snap") === "0" ? undefined : {
        snapTo: "labelsDirectional",
        duration: { min: 0.2, max: 0.6 },
        delay: 0.2,
        ease: "power1.inOut",
      },
    });
    apply();

    // Teclado: un nodo enfocado antes de «vivo» salta directo a «vivo», sin animar.
    const onFocus = (e: FocusEvent) => {
      if (!(e.target as Element).closest?.(".node")) return;
      if (st.progress >= 0.82) return;
      st.scroll(st.start + tl.labels.final / T * (st.end - st.start));
      tl.progress(st.progress);
      apply();
    };
    stage.addEventListener("focusin", onFocus);

    unregister = register(debug, "devops", {
      tl,
      st,
      progress: (n: number) => st.scroll(st.start + n * (st.end - st.start)),
    });

    return () => {
      stage.removeEventListener("focusin", onFocus);
      ScrollTrigger.removeEventListener("refreshInit", measure);
      stage.style.removeProperty("--title-h");
      stage.classList.remove("is-scene", "is-vivo", "is-live");
      q(".node", svg).forEach((n) => n.classList.remove("is-lit"));
      steps.forEach((li, i) => li.toggleAttribute("data-active", i === 0));
      chips.forEach((c) => c.classList.remove("is-on", "is-done"));
      route("1").classList.remove("is-rest");
      route("2").classList.remove("is-rest");
      unregister();
    };
  });

  return () => mm.revert();
}
