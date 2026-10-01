/**
 * Motor de motion v3 («Circuito»): UN solo bucle rAF para todo el sitio.
 *
 * Cada tarea devuelve `true` si en el próximo frame todavía tiene algo que
 * mover. Cuando ninguna lo pide, el bucle se duerme (cero frames en reposo) y
 * lo despierta `wake()` (scroll, puntero, clic, resize). Con la pestaña oculta
 * no corre: al volver, se reanuda con un dt acotado (sin saltos).
 */
export type Task = (dt: number, now: number) => boolean;

const tasks = new Set<Task>();
let raf = 0;
let last = 0;

function frame(now: number) {
  raf = 0;
  // dt en segundos, acotado: tras una pausa larga la física no da un salto.
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
  last = now;
  let busy = false;
  for (const t of tasks) if (t(dt, now)) busy = true;
  if (busy && !document.hidden) raf = requestAnimationFrame(frame);
  else last = 0;
}

export function wake() {
  if (raf || typeof window === "undefined" || document.hidden) return;
  raf = requestAnimationFrame(frame);
}

export function addTask(t: Task): () => void {
  tasks.add(t);
  wake();
  return () => {
    tasks.delete(t);
  };
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    } else wake();
  });
}

/**
 * Resorte con parámetros estilo Apple: `response` (s) y `damping` (1 = crítico).
 * Parte siempre del valor actual, así que es interrumpible: cambiar el destino a
 * mitad de camino no corta la velocidad. Se integra en subpasos de ≤ 8 ms: con
 * dt de 50 ms el Euler semiimplícito se volvía inestable.
 */
export class Spring {
  x: number;
  v = 0;
  t: number;
  private k: number;
  private c: number;

  constructor(x: number, response = 0.35, damping = 1) {
    this.x = this.t = x;
    this.k = (2 * Math.PI / response) ** 2;
    this.c = (4 * Math.PI * damping) / response;
  }

  set(t: number) {
    this.t = t;
  }

  snap(t: number) {
    this.x = this.t = t;
    this.v = 0;
  }

  /** Avanza dt segundos. Devuelve false cuando ya llegó (y lo deja exacto). */
  step(dt: number, eps = 0.01): boolean {
    let rest = dt;
    while (rest > 0) {
      const h = Math.min(rest, 0.008);
      const a = -this.k * (this.x - this.t) - this.c * this.v;
      this.v += a * h;
      this.x += this.v * h;
      rest -= h;
    }
    if (Math.abs(this.v) < eps * 10 && Math.abs(this.x - this.t) < eps) {
      this.x = this.t;
      this.v = 0;
      return false;
    }
    return true;
  }
}

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export const prefersReduced = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !document.documentElement.classList.contains("motion-lite"));

export const finePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
