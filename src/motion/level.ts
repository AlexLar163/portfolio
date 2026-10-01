/**
 * Nivel de motion. Se decide antes del primer paint con un script inline en
 * <head>; MotionRoot lo mantiene si cambia la preferencia del sistema.
 *
 *   (ninguno)     reduce, sin JS o ?motion=0 → estado final estático completo
 *   .motion-lite  hay motion: circuito, paquetes, resortes (lenguaje «Circuito»)
 *
 * `.js` se agrega siempre que hay JS (los controles que solo sirven con JS
 * cuelgan de esa clase). El nombre `motion-lite` se conserva de la v2: desde la
 * v3 no hay otro nivel (sin GSAP, sin escenas fijas).
 */
export const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

/** Puntero fino: imanes, spotlight de cursor y trazos al hover. */
export const FINE_QUERY = "(hover: hover) and (pointer: fine)";

export const LEVEL_SCRIPT = `(()=>{const c=document.documentElement.classList;c.add('js');if(/[?&]motion=0\\b/.test(location.search)||matchMedia('${REDUCE_QUERY}').matches)return;c.add('motion-lite')})()`;

export type MotionLevel = "none" | "lite";

/** Nivel según la preferencia del sistema y el parámetro ?motion=0. */
export function computeLevel(): MotionLevel {
  if (typeof window === "undefined") return "none";
  const q = new URLSearchParams(window.location.search).get("motion");
  if (q === "0" || window.matchMedia(REDUCE_QUERY).matches) return "none";
  return "lite";
}

export function currentLevel(): MotionLevel {
  if (typeof document === "undefined") return "none";
  return document.documentElement.classList.contains("motion-lite") ? "lite" : "none";
}

export const LEVEL_EVENT = "portfolio:motion-level";
