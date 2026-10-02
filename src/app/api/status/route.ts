import type { StatusPayload } from "@/data/status";
import { measureAll } from "./probe";

/**
 * GET /api/status — estado real de los sitios públicos (src/data/status.ts).
 *
 * Caché: ruta estática con ISR de 5 min (`force-static` + `revalidate`), sin
 * cron (el plan Hobby solo da 1/día). Se mide en el build; después, la primera
 * petición pasados 5 min recibe la respuesta guardada al instante y dispara la
 * nueva medición en segundo plano (stale-while-revalidate). Ninguna visita
 * espera las 7 mediciones, y la home ni siquiera la pide en su render: la lee
 * el bloque «Estado en vivo» en el cliente, tras `load`.
 *
 * `revalidate` tiene que ser un literal (Next lo analiza estático): 300 =
 * STATUS_REVALIDATE_S.
 */
export const runtime = "nodejs";
export const dynamic = "force-static";
export const revalidate = 300;

const EMPTY: StatusPayload = { measuredAt: null, sites: [] };

export async function GET() {
  const payload = await measureAll();
  // Si NO responde ninguno (ni este mismo sitio), lo roto es la red de quien
  // mide, no los 7 sitios: no se publica «todo caído». En el build se emite
  // «sin datos»; en una regeneración se lanza, y Next sigue sirviendo la
  // última medición buena hasta el próximo intento.
  if (payload.sites.every((s) => s.state === "down")) {
    if (process.env.NEXT_PHASE === "phase-production-build") return Response.json(EMPTY);
    throw new Error("[status] ningún sitio respondió: se conserva la medición anterior");
  }
  return Response.json(payload);
}
