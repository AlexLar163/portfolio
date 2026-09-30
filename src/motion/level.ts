/**
 * Niveles de motion (DISENO-v2 §7.1). Se deciden antes del primer paint con un
 * script inline en <head>; MotionRoot los mantiene al cambiar la ventana.
 *
 *   (ninguno)     reduce, sin JS o ?motion=0 → estado final estático
 *   .motion-lite  móvil, tablet, ventanas bajas → CSS + IntersectionObserver
 *   .motion-ok    desktop con puntero fino ≥ 1024×700 → además GSAP
 *
 * `.js` se agrega siempre que hay JS (los controles que solo sirven con JS, como
 * las pestañas de respaldo de Destacados, cuelgan de esa clase).
 */
export const MOTION_OK_QUERY =
  "(min-width:1024px) and (min-height:700px) and (hover:hover) and (pointer:fine)";

export const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

export const LEVEL_SCRIPT = `(()=>{const d=document.documentElement;d.classList.add('js');const q=new URLSearchParams(location.search).get('motion');if(q==='0'||matchMedia('${REDUCE_QUERY}').matches)return;d.classList.add('motion-lite');if(matchMedia('${MOTION_OK_QUERY}').matches)d.classList.add('motion-ok')})()`;

export type MotionLevel = "none" | "lite" | "ok";

/** Nivel actual según la ventana y el parámetro ?motion=0. */
export function computeLevel(): MotionLevel {
  if (typeof window === "undefined") return "none";
  const q = new URLSearchParams(window.location.search).get("motion");
  if (q === "0" || window.matchMedia(REDUCE_QUERY).matches) return "none";
  return window.matchMedia(MOTION_OK_QUERY).matches ? "ok" : "lite";
}

export function currentLevel(): MotionLevel {
  if (typeof document === "undefined") return "none";
  const c = document.documentElement.classList;
  return c.contains("motion-ok") ? "ok" : c.contains("motion-lite") ? "lite" : "none";
}

export const LEVEL_EVENT = "portfolio:motion-level";
