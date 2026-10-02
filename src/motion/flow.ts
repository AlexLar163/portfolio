import { addTask, wake } from "./engine";

/**
 * Tráfico de los diagramas de flujo de los casos (src/components/cases/Flow.tsx),
 * en el bucle compartido del sitio (engine.ts), con el mismo paquete que el
 * diagrama DevOps. No reutiliza traffic.ts: aquél arma rutas con las aristas del
 * diagrama de infraestructura (src/data/infra.ts); aquí la ruta es la espina de
 * pasos, medida del DOM.
 *
 * Un paquete baja por la espina, enciende el LED de cada paso al cruzarlo,
 * descansa y vuelve a salir. Solo corre con el diagrama a la vista y sin pausa
 * (`data-paused` en `.flow`, botón de pausa: WCAG 2.2.2). Con reduce no se monta.
 */
/** px de pantalla por segundo: más lento que el diagrama DevOps, acá se lee cada paso. */
const SPEED = 260;
/** Descanso entre pasadas (ms). */
const REST = 1100;
/** Cuánto queda encendido un paso tras el paso del paquete (ms). */
const HIT = 320;

export function mountFlow(root: HTMLElement): () => void {
  const body = root.querySelector<HTMLElement>(".flow__body");
  const pk = root.querySelector<HTMLElement>(".flow__pk");
  const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-flow-step]"));
  if (!body || !pk || steps.length < 2) return () => {};

  let ys: number[] = [];
  let x = 0;
  let y = 0;
  let restUntil = 0;
  let visible = false;
  const hitAt = steps.map(() => -Infinity);

  // Centros de los LED relativos a la espina, medidos fuera del frame.
  const measure = () => {
    const b = body.getBoundingClientRect();
    ys = steps.map((li) => {
      const led = li.querySelector<HTMLElement>(".flow__led")!.getBoundingClientRect();
      x = led.left + led.width / 2 - b.left;
      return led.top + led.height / 2 - b.top;
    });
    y = Math.min(Math.max(y, ys[0]), ys[ys.length - 1]);
  };
  measure();
  y = ys[0];
  const ro = new ResizeObserver(() => {
    measure();
    wake();
  });
  ro.observe(body);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) wake();
  });
  io.observe(body);
  root.setAttribute("data-flowing", "");

  const off = addTask((dt, now) => {
    if (!visible || root.hasAttribute("data-paused")) return false;
    const end = ys[ys.length - 1];
    if (now < restUntil) {
      pk.style.opacity = "0";
    } else {
      if (y >= end) y = ys[0];
      const prev = y;
      y = Math.min(end, y + SPEED * dt);
      ys.forEach((ly, i) => {
        if (prev <= ly && y >= ly) hitAt[i] = now;
      });
      pk.style.opacity = "1";
      pk.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      if (y >= end) restUntil = now + REST;
    }
    steps.forEach((li, i) => li.classList.toggle("is-hit", now - hitAt[i] < HIT));
    return true;
  });

  return () => {
    off();
    ro.disconnect();
    io.disconnect();
    root.removeAttribute("data-flowing");
    steps.forEach((li) => li.classList.remove("is-hit"));
    pk.style.opacity = "";
    pk.style.transform = "";
  };
}
