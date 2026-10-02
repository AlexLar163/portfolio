import type { StatusPayload } from "@/data/status";

/**
 * Puente entre el bloque «Estado en vivo» (que lee /api/status) y el tráfico
 * del diagrama (traffic.ts): el bloque publica cada medición y el tráfico se
 * suscribe. Quien se suscribe tarde recibe la última al instante.
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
