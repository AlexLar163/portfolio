import type { RouteId } from "@/motion/traffic";

/**
 * «Estado en vivo» de la sección DevOps y CTA dinámico de las demos: sitios
 * PÚBLICOS que se miden de verdad desde el servidor (src/app/api/status).
 * Ningún hostname interno.
 *
 *   kind   → "public": siempre en vivo; un error es una falla («Caído»).
 *            "demo":   WordPress del taller, encendidos según la capacidad del
 *            VPS. Un 502 o un error de TLS es «apagado», no una falla: no
 *            cuenta como degradado y su tarjeta no enlaza (nunca un enlace a
 *            un sitio que responde 502).
 *   host   → rótulo de dónde corre (messages → `devops.live.hosts.<host>`)
 *   retry  → reintentos ante 5xx o error de red (Orthodent da 508 a veces)
 *   route  → ruta del diagrama cuyo tráfico sigue la latencia medida del sitio
 *            (src/motion/traffic.ts). Solo Bitácora corre en el VPS dibujado.
 *   timeoutMs → corte propio; por defecto STATUS_TIMEOUT_MS.
 *
 * Públicos verificados con una petición real el 2-oct-2026 (los 7 dieron 200).
 * Demos verificadas el 3-oct-2026: 7 encendidas (200), 4 con 502 y REBORN sin
 * certificado (error TLS).
 */
export type StatusHost = "vercel" | "vps" | "aws" | "shared" | "systeme";
export type StatusKind = "public" | "demo";

export type StatusSite = {
  id: string;
  name: string;
  url: string;
  host: StatusHost;
  kind: StatusKind;
  retry?: number;
  route?: RouteId;
  timeoutMs?: number;
};

/**
 * Demos WordPress del taller: el slug es a la vez el subdominio
 * (`https://<slug>.taller.works`) y el id en /api/status. Las tarjetas de
 * src/data/showcase.ts las referencian por `liveSlug` (tipado con `DemoId`).
 * Bitácora no está acá: es estática y siempre en vivo (va con las públicas).
 */
export const TALLER_DEMOS = [
  ["aromas", "Aromas del Sur"],
  ["instituto", "Instituto del Sur"],
  ["ironpulse", "IRONPULSE"],
  ["lume", "Lume Estética & Spa"],
  ["meridiano", "Meridiano Studio"],
  ["pavon", "Ahumados Pavón"],
  ["reborn", "REBORN"],
  ["recreo", "Recreo"],
  ["reverso", "Reverso Studio"],
  ["solnova", "SolNova Energía"],
  ["vertice", "Vértice Studio"],
] as const;

export type DemoId = (typeof TALLER_DEMOS)[number][0];

/**
 * Una demo apagada responde 502 en menos de medio segundo; la que tarda más de
 * 5 s no está en condiciones de mostrarse. Corte más corto que el de las
 * públicas para que las 18 mediciones en paralelo terminen holgadas dentro del
 * límite de la función (medido: ver la ruta).
 */
export const DEMO_TIMEOUT_MS = 5000;

export const statusSites: StatusSite[] = [
  { id: "portfolio", name: "alexlargo.tech", url: "https://alexlargo.tech", host: "vercel", kind: "public" },
  { id: "turnia", name: "Turnia", url: "https://turnia-saas.vercel.app", host: "vercel", kind: "public" },
  { id: "bitacora", name: "Bitácora", url: "https://bitacora.taller.works", host: "vps", kind: "public", route: "web" },
  { id: "3destiny", name: "3Destiny", url: "https://3destinyra.com", host: "aws", kind: "public" },
  { id: "orthodent", name: "Orthodent", url: "https://orthodent.com.ec", host: "shared", kind: "public", retry: 1 },
  { id: "ale", name: "Argentina Local Expert", url: "https://www.argentinalocalexpert.com", host: "systeme", kind: "public" },
  { id: "diamante", name: "Diamante", url: "https://diamante-anotador-beisbol.vercel.app", host: "vercel", kind: "public" },
  ...TALLER_DEMOS.map(
    ([id, name]): StatusSite => ({
      id,
      name,
      url: demoUrl(id),
      host: "vps",
      kind: "demo",
      timeoutMs: DEMO_TIMEOUT_MS,
    }),
  ),
];

/** URL pública de una demo del taller. */
export function demoUrl(id: DemoId) {
  return `https://${id}.taller.works`;
}

/** Corte de la medición: pasado esto el sitio cuenta como caído. */
export const STATUS_TIMEOUT_MS = 8000;
/** Respuesta correcta pero más lenta que esto = degradado. */
export const STATUS_SLOW_MS = 3000;
/** Cada cuánto se renueva la medición (s). Tiene que coincidir con `revalidate` de la ruta. */
export const STATUS_REVALIDATE_S = 300;

export type SiteState = "ok" | "degraded" | "down";

/** Contrato de GET /api/status. */
export type SiteResult = {
  id: string;
  state: SiteState;
  /** Hasta el primer byte de la respuesta final (redirecciones incluidas). null si no respondió. */
  ms: number | null;
  /** Código HTTP final. null si no respondió. */
  code: number | null;
};

/**
 * ¿Se puede enlazar? Respondió sin error (2xx/3xx), aunque sea lento. Para una
 * demo, la sonda ya convierte cualquier ≥ 400 o error de red en `down`, así que
 * un 502 nunca pasa por acá.
 */
export const isUp = (r: SiteResult | undefined) =>
  !!r && r.state !== "down" && r.code !== null && r.code < 400;

export type StatusPayload = {
  /** ISO 8601. null = no hay medición válida («sin datos ahora»). */
  measuredAt: string | null;
  sites: SiteResult[];
};
