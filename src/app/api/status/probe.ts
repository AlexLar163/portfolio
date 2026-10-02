import { request as httpRequest, type IncomingMessage } from "node:http";
import { request as httpsRequest } from "node:https";
import {
  STATUS_SLOW_MS,
  STATUS_TIMEOUT_MS,
  statusSites,
  type SiteResult,
  type StatusPayload,
  type StatusSite,
} from "@/data/status";

/**
 * Medición real de los sitios públicos (solo servidor, runtime Node).
 *
 * Va con `node:https` y no con `fetch` A PROPÓSITO: Next parchea `fetch` con su
 * caché de datos, y una respuesta servida desde esa caché mide 0 ms. Así cada
 * regeneración de /api/status sale a la red de verdad, y la ruta sigue siendo
 * estática (sin `cache: 'no-store'`, que la volvería dinámica).
 */
const UA = "alexlargo-status/1.0 (+https://alexlargo.tech)";
const MAX_REDIRECTS = 5;

type Hop = { code: number; location?: string };

/** Un GET hasta los encabezados; el cuerpo no se descarga. */
function hop(url: URL, signal: AbortSignal): Promise<Hop> {
  return new Promise((resolve, reject) => {
    const req = (url.protocol === "http:" ? httpRequest : httpsRequest)(
      url,
      { method: "GET", headers: { "user-agent": UA, accept: "text/html,*/*;q=0.8" }, signal },
      (res: IncomingMessage) => {
        resolve({ code: res.statusCode ?? 0, location: res.headers.location });
        res.destroy();
      },
    );
    req.on("error", reject);
    req.end();
  });
}

/** Una medición: sigue redirecciones (`redirect: 'follow'`) dentro del mismo corte de 8 s. */
async function once(site: StatusSite): Promise<SiteResult & { timedOut?: boolean }> {
  const signal = AbortSignal.timeout(STATUS_TIMEOUT_MS);
  const t0 = performance.now();
  try {
    let url = new URL(site.url);
    let res = await hop(url, signal);
    for (let i = 0; i < MAX_REDIRECTS && res.code >= 300 && res.code < 400 && res.location; i++) {
      url = new URL(res.location, url);
      res = await hop(url, signal);
    }
    const ms = Math.round(performance.now() - t0);
    const state = res.code >= 400 || ms > STATUS_SLOW_MS ? "degraded" : "ok";
    return { id: site.id, state, ms, code: res.code };
  } catch {
    return { id: site.id, state: "down", ms: null, code: null, timedOut: signal.aborted };
  }
}

/** Reintento solo ante 5xx o error de red rápido; un timeout no se repite (serían 16 s). */
async function measure(site: StatusSite): Promise<SiteResult> {
  let r = await once(site);
  for (let k = 0; k < (site.retry ?? 0); k++) {
    const retryable = (r.code !== null && r.code >= 500) || (r.state === "down" && !r.timedOut);
    if (!retryable) break;
    r = await once(site);
  }
  const { timedOut: _t, ...result } = r;
  void _t;
  return result;
}

export async function measureAll(): Promise<StatusPayload> {
  const sites = await Promise.all(statusSites.map(measure));
  return { measuredAt: new Date().toISOString(), sites };
}
