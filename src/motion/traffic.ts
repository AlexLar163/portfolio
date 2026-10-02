import { edges, VIEWBOX } from "@/data/infra";
import { statusSites } from "@/data/status";
import type { Point } from "@/data/types";
import { addTask, wake } from "./engine";
import { onStatus } from "./live";

/**
 * Tráfico vivo del diagrama DevOps (v3 «Circuito»), en el bucle compartido.
 * Los paquetes recorren rutas REALES del stack, armadas con las aristas del
 * diagrama (src/data/infra.ts): si cambia una arista, la ruta la sigue.
 *
 *   «tronco>eX»: el bus de Caddy se recorre solo hasta donde nace eX.
 *
 * Entre una arista y la siguiente el paquete cruza el nodo en línea recta: la
 * capa de paquetes va debajo de los nodos (relleno opaco), así que solo se ve
 * sobre las aristas y el nodo «parpadea» al recibirlo.
 */
export type RouteId = "web" | "bot" | "panel" | "deploy" | "cron" | "cli" | "backup";

const ROUTES: Record<RouteId, string[]> = {
  web: ["e1", "e2", "trunk>e3", "e9"],
  bot: ["e6", "trunk>e5", "e7"],
  panel: ["e1", "e2", "trunk>e4", "e8"],
  deploy: ["e13"],
  cron: ["e12", "e7"],
  cli: ["e10"],
  backup: ["e11"],
};

/** Cadencia ambiente por ruta (ms, mín–máx). Lo programado pasa poco. */
const GAP: Record<RouteId, [number, number]> = {
  web: [900, 1700],
  bot: [1500, 2700],
  panel: [4200, 7000],
  deploy: [5200, 8200],
  cron: [7500, 11000],
  cli: [9000, 14000],
  backup: [10000, 15000],
};

/** Velocidad en px de pantalla por segundo: igual a cualquier escala del SVG. */
const SPEED = 420;
const MAX_AMBIENT = 7;

/**
 * Latencia REAL (bloque «Estado en vivo», /api/status): la ruta de un sitio
 * medido (`route` en src/data/status.ts) corre más rápido y más seguido cuanto
 * menos tarda el sitio, y si está caído no nace tráfico ambiente por ella.
 * A LIVE_REF_MS va a SPEED (factor 1); escala log2, acotada para que se lea.
 */
const LIVE_REF_MS = 400;
const LIVE_MIN = 0.6;
const LIVE_MAX = 1.4;
const liveRate = (ms: number) =>
  Math.min(LIVE_MAX, Math.max(LIVE_MIN, 1 + 0.35 * Math.log2(LIVE_REF_MS / Math.max(ms, 1))));
const SVG = "http://www.w3.org/2000/svg";

type Orientation = "land" | "port";
type Route = { pts: Point[]; cum: number[]; len: number; hits: { id: string; d: number }[] };
type Packet = { r: Route; g: SVGGElement; d: number; hit: number; manual: boolean; v: number };

function onSegment(p: Point, a: Point, b: Point) {
  const cross = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  if (Math.abs(cross) > 0.5) return false;
  return (
    p[0] >= Math.min(a[0], b[0]) - 0.5 &&
    p[0] <= Math.max(a[0], b[0]) + 0.5 &&
    p[1] >= Math.min(a[1], b[1]) - 0.5 &&
    p[1] <= Math.max(a[1], b[1]) + 0.5
  );
}

function buildRoute(seq: string[], o: Orientation): Route {
  const pts: Point[] = [];
  const hitAt: { id: string; idx: number }[] = [];
  const byId = (id: string) => edges.find((e) => e.id === id)!;
  seq.forEach((step, k) => {
    let poly: Point[];
    let edge;
    if (step.includes(">")) {
      const [trunkId, branchId] = step.split(">");
      const trunk = byId(trunkId)[o];
      edge = byId(branchId);
      const start = edge[o][0];
      poly = [];
      for (let i = 0; i < trunk.length - 1; i++) {
        poly.push(trunk[i]);
        if (onSegment(start, trunk[i], trunk[i + 1])) break;
      }
      poly.push(...edge[o]);
    } else {
      edge = byId(step);
      poly = edge[o];
    }
    if (k === 0) hitAt.push({ id: edge.from, idx: 0 });
    pts.push(...poly);
    hitAt.push({ id: edge.to, idx: pts.length - 1 });
  });
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, len: cum[cum.length - 1], hits: hitAt.map((h) => ({ id: h.id, d: cum[h.idx] })) };
}

function ptAt(r: Route, d: number): Point {
  const { pts, cum } = r;
  let i = 1;
  while (i < cum.length - 1 && cum[i] < d) i++;
  const seg = cum[i] - cum[i - 1] || 1;
  const t = Math.min(1, Math.max(0, (d - cum[i - 1]) / seg));
  return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t];
}

export type Traffic = { send: (nodeId: string) => void; sendRoute: (r: RouteId) => void; destroy: () => void };

/**
 * `paused()` lo decide el componente (botón de pausa, WCAG 2.2.2): en pausa no
 * nace tráfico ambiente y el que hay se congela; lo que envía la persona con
 * un clic sí corre, porque lo pidió.
 */
export function mountTraffic(svg: SVGSVGElement, o: Orientation, paused: () => boolean): Traffic {
  const layer = svg.querySelector<SVGGElement>(".packets");
  if (!layer) return { send() {}, sendRoute() {}, destroy() {} };
  const routes = Object.fromEntries(
    (Object.keys(ROUTES) as RouteId[]).map((id) => [id, buildRoute(ROUTES[id], o)]),
  ) as Record<RouteId, Route>;
  const nodeEl = (id: string) => svg.querySelector<SVGGElement>(`[data-node="${id}"]`);
  const packets: Packet[] = [];
  const timers = new Set<number>();
  let visible = false;
  let scale = 1;
  const next: Partial<Record<RouteId, number>> = {};
  /** Factor de velocidad/cadencia por ruta según la medición real; sin dato, 1. */
  const rate: Partial<Record<RouteId, number>> = {};
  /** Rutas cuyo sitio medido está caído: sin tráfico ambiente. */
  const dark = new Set<RouteId>();
  const offLive = onStatus((p) => {
    for (const site of statusSites) {
      if (!site.route) continue;
      const r = p.sites.find((s) => s.id === site.id);
      dark.delete(site.route);
      delete rate[site.route];
      if (!r) continue;
      if (r.state === "down" || r.ms === null) dark.add(site.route);
      else rate[site.route] = liveRate(r.ms);
    }
  });

  const measure = () => {
    const w = svg.getBoundingClientRect().width;
    scale = w ? w / VIEWBOX[o].w : 1;
  };
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) {
      measure();
      wake();
    }
  });
  io.observe(svg);

  const flash = (id: string) => {
    const el = nodeEl(id) as (SVGGElement & { _hit?: number }) | null;
    if (!el) return;
    el.classList.add("is-hit");
    // Otro paquete en el mismo nodo extiende el destello, no lo reinicia.
    if (el._hit) {
      window.clearTimeout(el._hit);
      timers.delete(el._hit);
    }
    const t = window.setTimeout(() => {
      el.classList.remove("is-hit");
      timers.delete(t);
      el._hit = undefined;
    }, 140);
    el._hit = t;
    timers.add(t);
  };

  const spawn = (id: RouteId, manual: boolean) => {
    const g = document.createElementNS(SVG, "g");
    g.setAttribute("class", `pk pk--${id}`);
    const h = document.createElementNS(SVG, "circle");
    h.setAttribute("class", "pk__halo");
    h.setAttribute("r", "10");
    const c = document.createElementNS(SVG, "circle");
    c.setAttribute("class", "pk__core");
    c.setAttribute("r", o === "land" ? "4.2" : "4.4");
    g.append(h, c);
    const r = routes[id];
    const [x, y] = r.pts[0];
    g.setAttribute("transform", `translate(${x} ${y})`);
    layer.appendChild(g);
    packets.push({ r, g, d: 0, hit: 0, manual, v: rate[id] ?? 1 });
    wake();
  };

  const burst = (id: RouteId) => {
    for (let k = 0; k < 3; k++) {
      const t = window.setTimeout(() => {
        timers.delete(t);
        spawn(id, true);
      }, k * 120);
      timers.add(t);
    }
  };

  const off = addTask((dt, now) => {
    const frozen = paused();
    // display:none (la otra composición) nunca interseca: `visible` ya lo cubre.
    const live = visible && !frozen;
    if (live) {
      const ambient = packets.filter((p) => !p.manual).length;
      for (const id of Object.keys(GAP) as RouteId[]) {
        if (next[id] === undefined) next[id] = now + Math.random() * GAP[id][0];
        if (now >= next[id]! && ambient < MAX_AMBIENT) {
          if (!dark.has(id)) spawn(id, false);
          const k = 1 / (rate[id] ?? 1);
          next[id] = now + (GAP[id][0] + Math.random() * (GAP[id][1] - GAP[id][0])) * k;
        }
      }
    }
    const step = (SPEED / scale) * dt;
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      if (frozen && !p.manual) continue;
      p.d += step * p.v;
      const [x, y] = ptAt(p.r, Math.min(p.d, p.r.len));
      p.g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      while (p.hit < p.r.hits.length && p.d >= p.r.hits[p.hit].d) flash(p.r.hits[p.hit++].id);
      if (p.d >= p.r.len) {
        p.g.remove();
        packets.splice(i, 1);
      }
    }
    // Despierto mientras haya algo en vuelo o el diagrama esté a la vista y vivo.
    return packets.some((p) => p.manual || !frozen) || live;
  });

  return {
    sendRoute: (id) => {
      measure();
      burst(id);
    },
    send: (nodeId) => {
      measure();
      const hit = (Object.keys(ROUTES) as RouteId[]).filter((id) =>
        routes[id].hits.some((h) => h.id === nodeId),
      );
      if (!hit.length) {
        flash(nodeId);
        return;
      }
      // Como mucho dos rutas por clic: el nodo se lee, no se satura.
      hit.slice(0, 2).forEach(burst);
    },
    destroy: () => {
      off();
      offLive();
      io.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      packets.forEach((p) => p.g.remove());
      packets.length = 0;
    },
  };
}
