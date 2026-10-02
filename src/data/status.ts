import type { RouteId } from "@/motion/traffic";

/**
 * «Estado en vivo» de la sección DevOps: sitios PÚBLICOS que se miden de verdad
 * desde el servidor (src/app/api/status). Solo URLs públicas y siempre en vivo:
 * de `*.taller.works` entra solo Bitácora (las demás demos son bajo pedido y
 * estarían apagadas). Ningún hostname interno.
 *
 * Verificadas con una petición real el 2-oct-2026 (las 7 respondieron 200).
 *
 *   host   → rótulo de dónde corre (messages → `devops.live.hosts.<host>`)
 *   retry  → reintentos ante 5xx o error de red (Orthodent da 508 a veces)
 *   route  → ruta del diagrama cuyo tráfico sigue la latencia medida del sitio
 *            (src/motion/traffic.ts). Solo Bitácora corre en el VPS dibujado.
 */
export type StatusHost = "vercel" | "vps" | "aws" | "shared" | "systeme";

export type StatusSite = {
  id: string;
  name: string;
  url: string;
  host: StatusHost;
  retry?: number;
  route?: RouteId;
};

export const statusSites: StatusSite[] = [
  { id: "portfolio", name: "alexlargo.tech", url: "https://alexlargo.tech", host: "vercel" },
  { id: "turnia", name: "Turnia", url: "https://turnia-saas.vercel.app", host: "vercel" },
  { id: "bitacora", name: "Bitácora", url: "https://bitacora.taller.works", host: "vps", route: "web" },
  { id: "3destiny", name: "3Destiny", url: "https://3destinyra.com", host: "aws" },
  { id: "orthodent", name: "Orthodent", url: "https://orthodent.com.ec", host: "shared", retry: 1 },
  { id: "ale", name: "Argentina Local Expert", url: "https://www.argentinalocalexpert.com", host: "systeme" },
  { id: "diamante", name: "Diamante", url: "https://diamante-anotador-beisbol.vercel.app", host: "vercel" },
];

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

export type StatusPayload = {
  /** ISO 8601. null = no hay medición válida («sin datos ahora»). */
  measuredAt: string | null;
  sites: SiteResult[];
};
