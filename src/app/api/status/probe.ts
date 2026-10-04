import { request as httpRequest, type IncomingMessage } from "node:http";
import { request as httpsRequest } from "node:https";
import {
  STATUS_SLOW_MS,
  STATUS_TIMEOUT_MS,
  VPS_BUDGET_MS,
  VPS_CONCURRENCY,
  VPS_SLOW_MS,
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

type Method = "GET" | "HEAD";

/** Una petición hasta los encabezados; el cuerpo no se descarga. */
function hop(url: URL, signal: AbortSignal, method: Method): Promise<Hop> {
  return new Promise((resolve, reject) => {
    const req = (url.protocol === "http:" ? httpRequest : httpsRequest)(
      url,
      { method, headers: { "user-agent": UA, accept: "text/html,*/*;q=0.8" }, signal },
      (res: IncomingMessage) => {
        resolve({ code: res.statusCode ?? 0, location: res.headers.location });
        res.destroy();
      },
    );
    req.on("error", reject);
    req.end();
  });
}

/**
 * Una medición: sigue redirecciones (`redirect: 'follow'`) dentro del mismo
 * corte (8 s las públicas, 5 s las demos).
 *
 * Un código ≥ 400 es «degradado» en un sitio público (responde, pero mal) y
 * «caído» en una demo del taller: el 502 es Caddy diciendo que el contenedor
 * está apagado, y una demo apagada no se enlaza.
 */
async function once(
  site: StatusSite,
  method: Method,
  timeoutMs = site.timeoutMs ?? STATUS_TIMEOUT_MS,
): Promise<SiteResult & { timedOut?: boolean }> {
  // AbortSignal.timeout exige un entero; `left` llega con decimales.
  const signal = AbortSignal.timeout(Math.max(1, Math.floor(timeoutMs)));
  const t0 = performance.now();
  try {
    let url = new URL(site.url);
    let res = await hop(url, signal, method);
    for (let i = 0; i < MAX_REDIRECTS && res.code >= 300 && res.code < 400 && res.location; i++) {
      url = new URL(res.location, url);
      res = await hop(url, signal, method);
    }
    const ms = Math.round(performance.now() - t0);
    const failed = res.code >= 400;
    const state = failed && site.kind === "demo" ? "down" : failed || ms > (site.host === "vps" ? VPS_SLOW_MS : STATUS_SLOW_MS) ? "degraded" : "ok";
    return { id: site.id, state, ms, code: res.code };
  } catch {
    return { id: site.id, state: "down", ms: null, code: null, timedOut: signal.aborted };
  }
}

/**
 * Reintento ante 5xx o error de red rápido; un timeout no se repite (serían
 * 16 s). En una demo, el 502 es la respuesta («apagada») y no se reintenta;
 * sí un error de red, que con el VPS ocupado puede ser pasajero.
 *
 * Los sitios del VPS van con HEAD: WordPress arma la página igual, pero no la
 * manda. Si el servidor no acepta HEAD (405 u otro 4xx), se repite con GET.
 */
async function measure(site: StatusSite, timeoutMs?: number): Promise<SiteResult> {
  const vps = site.host === "vps";
  let r = await once(site, vps ? "HEAD" : "GET", timeoutMs);
  if (vps && r.code !== null && r.code >= 400 && r.code < 500) r = await once(site, "GET", timeoutMs);
  for (let k = 0; k < (site.retry ?? 0); k++) {
    const fiveXX = r.code !== null && r.code >= 500 && !(site.kind === "demo" && r.code === 502);
    const retryable = fiveXX || (r.state === "down" && r.code === null && !r.timedOut);
    if (!retryable) break;
    r = await once(site, vps ? "HEAD" : "GET", timeoutMs);
  }
  const { timedOut: _t, ...result } = r;
  void _t;
  return result;
}

/**
 * Los 12 sitios del VPS (Bitácora + demos) comparten 1 vCPU: medirlos todos a
 * la vez los medía a ellos peleando por la CPU (0,4 → 2 s y «Degradado»). Van
 * de a VPS_CONCURRENCY y dentro de un presupuesto total: el que no alcanza a
 * empezar con al menos 1 s por delante queda fuera del payload («Sin datos» en
 * el bloque, «Bajo pedido» en la tarjeta), nunca como «apagado» inventado.
 */
async function measureVps(sites: StatusSite[]): Promise<SiteResult[]> {
  const deadline = performance.now() + VPS_BUDGET_MS;
  const out = new Map<string, SiteResult>();
  let next = 0;
  const worker = async () => {
    while (next < sites.length) {
      const site = sites[next++];
      const left = deadline - performance.now();
      if (left < 1000) continue;
      out.set(site.id, await measure(site, Math.min(site.timeoutMs ?? STATUS_TIMEOUT_MS, left)));
    }
  };
  await Promise.all(Array.from({ length: VPS_CONCURRENCY }, worker));
  return sites.flatMap((s) => out.get(s.id) ?? []);
}

/** Públicos externos en paralelo; los del VPS, en su cola. Orden del payload = statusSites. */
export async function measureAll(): Promise<StatusPayload> {
  const vps = statusSites.filter((s) => s.host === "vps");
  const [ext, own] = await Promise.all([
    Promise.all(statusSites.filter((s) => s.host !== "vps").map((s) => measure(s))),
    measureVps(vps),
  ]);
  const byId = new Map([...ext, ...own].map((r) => [r.id, r]));
  const sites = statusSites.flatMap((s) => byId.get(s.id) ?? []);
  return { measuredAt: new Date().toISOString(), sites };
}
