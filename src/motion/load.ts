import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";
import { markGsapFailed } from "./level";

export type Gsap = typeof GsapType;
export type ST = typeof ScrollTriggerType;
export type Kit = { gsap: Gsap; ScrollTrigger: ST; debug: boolean };

/** Si GSAP no llega en este tiempo (red), la página se queda en su estado final. */
const TIMEOUT = 5000;

let ready: Promise<Kit> | null = null;

/**
 * GSAP + ScrollTrigger en un chunk aparte (DISENO-v2 §7.5): solo lo pide
 * `.motion-ok` y nunca antes de `load`. Una sola promesa para todas las escenas.
 */
export function gsapReady(): Promise<Kit> {
  if (ready) return ready;
  const load = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
    const gsap = g.gsap;
    const ScrollTrigger = s.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);
    // La barra de direcciones de iOS no dispara refresh (v2 §7.2).
    ScrollTrigger.config({ ignoreMobileResize: true });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const debug =
      process.env.NODE_ENV !== "production" &&
      new URLSearchParams(window.location.search).get("motion") === "debug";
    return { gsap, ScrollTrigger, debug };
  });
  const timeout = new Promise<never>((_, reject) =>
    window.setTimeout(() => reject(new Error("gsap timeout")), TIMEOUT),
  );
  ready = Promise.race([load, timeout]).catch((e) => {
    markGsapFailed();
    throw e;
  });
  return ready;
}

/** Espera al evento `load` (el chunk de GSAP nunca compite con el LCP). */
export function afterLoad(): Promise<void> {
  if (document.readyState === "complete") return Promise.resolve();
  return new Promise((res) => window.addEventListener("load", () => res(), { once: true }));
}

/** Color de un token CSS en un formato que GSAP interpola (el canvas normaliza). */
export function tokenColor(name: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return v;
  ctx.fillStyle = v;
  return ctx.fillStyle;
}

type Registry = Record<string, { progress: (n: number) => void; [k: string]: unknown }>;

/** `?motion=debug` fuera de producción: `window.__scenes.<name>.progress(n)` para QA. */
export function register(debug: boolean, name: string, api: Registry[string]) {
  if (!debug) return () => {};
  const w = window as unknown as { __scenes?: Registry };
  w.__scenes ??= {};
  w.__scenes[name] = api;
  return () => {
    delete w.__scenes?.[name];
  };
}
