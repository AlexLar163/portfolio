import type { StatusPayload } from "@/data/status";

/**
 * Puente entre /api/status y quienes lo usan: el bloque «Estado en vivo», el
 * tráfico del diagrama (traffic.ts) y el CTA de cada demo del taller. Una sola
 * petición por medición: `loadStatus` reutiliza la que esté en vuelo, y cada
 * resultado se publica a todos. Quien se suscribe tarde recibe la última al
 * instante.
 */
type Listener = (p: StatusPayload) => void;

let latest: StatusPayload | null = null;
const listeners = new Set<Listener>();

export function publishStatus(p: StatusPayload) {
  latest = p;
  listeners.forEach((f) => f(p));
}

export function onStatus(f: Listener) {
  listeners.add(f);
  if (latest) f(latest);
  return () => {
    listeners.delete(f);
  };
}

export type StatusLoad = { payload: StatusPayload; date: string | null };

let inflight: Promise<StatusLoad> | null = null;

/**
 * GET /api/status, compartido: si ya hay una petición en vuelo, se espera esa.
 * Publica la medición si es válida; si no, rechaza (cada llamador decide qué
 * mostrar). `date` es el encabezado Date del servidor (para el desfase).
 */
export function loadStatus(): Promise<StatusLoad> {
  inflight ??= (async () => {
    try {
      const res = await fetch("/api/status");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = (await res.json()) as StatusPayload;
      if (!payload?.measuredAt || !Array.isArray(payload.sites) || !payload.sites.length) throw new Error("sin datos");
      publishStatus(payload);
      return { payload, date: res.headers.get("date") };
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Pide la medición solo si nadie la tiene ni la está pidiendo (CTA de las demos). */
export function ensureStatus() {
  if (!latest && !inflight) loadStatus().catch(() => {});
}

/** Corre `f` tras `load` y en reposo: nunca en el camino crítico ni en el LCP. */
export function afterLoadIdle(f: () => void): () => void {
  let idleId: number | undefined;
  const whenIdle = () => {
    if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(f, { timeout: 2000 });
    else idleId = window.setTimeout(f, 200);
  };
  if (document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle, { once: true });
  return () => {
    window.removeEventListener("load", whenIdle);
    if (idleId !== undefined) {
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      window.clearTimeout(idleId);
    }
  };
}
