import type { GalleryRef, MediaRef } from "./types";

/**
 * Casos de estudio (contenido: _insumos/CASOS.md → messages `cases.items.<slug>`).
 * Aquí solo lo que no es texto: orden, tipo, media por bloque y a qué tarjeta de
 * la home pertenece cada caso. Los slugs son iguales en ES y EN.
 *
 * Reglas de contenido (CASOS.md, riesgos R1–R6): el caso 3Destiny no menciona
 * cuentas admin, staging ni el VPS, ni Performance/LCP; el pipeline nunca se
 * presenta como generador de propuestas. Las imágenes del pipeline van con el
 * pie «esquema ilustrativo» (R3).
 */
export type CaseKind = "client" | "demo" | "own-tool";

export type CaseFigure = {
  /** Clave en `cases.items.<slug>.figures` (pie de foto y alt). */
  ref: MediaRef;
  inset?: MediaRef;
  /** Pie «esquema ilustrativo, datos de ejemplo» (R3). */
  illustrative?: boolean;
};

export type CaseDef = {
  slug: string;
  kind: CaseKind;
  /** Cabecera: recorrido en video o imagen (MediaFrame). */
  hero: GalleryRef;
  /** Vera: los cuatro rubros en un selector (portada + recorrido por rubro). */
  variants?: { id: string; media: GalleryRef }[];
  /** Pie de la cabecera ilustrativo (pipeline). */
  heroIllustrative?: boolean;
  /** Dirección que muestra la barra del marco: dominio público o «capturas». */
  address?: string;
  context?: CaseFigure[];
  solution?: CaseFigure[];
  results?: CaseFigure[];
};

const VERA_RUBROS = ["barberia", "cantina", "odontologia", "taller"];

export const cases: CaseDef[] = [
  {
    slug: "3destiny",
    kind: "client",
    address: "3destinyra.com",
    hero: { main: { slug: "3destiny", key: "portada" }, video: { slug: "3destiny", key: "recorrido" } },
    context: [{ ref: { slug: "3destiny", key: "portada" } }],
    solution: [{ ref: { slug: "3destiny", key: "galeria-01" } }, { ref: { slug: "3destiny", key: "galeria-02" } }],
    results: [{ ref: { slug: "3destiny", key: "galeria-03" } }],
  },
  {
    slug: "turnia",
    kind: "demo",
    address: "turnia-saas.vercel.app",
    hero: { main: { slug: "turnia", key: "landing-portada" }, video: { slug: "turnia", key: "recorrido" } },
    solution: [
      { ref: { slug: "turnia", key: "landing-portada" } },
      { ref: { slug: "turnia", key: "app-portada" }, inset: { slug: "turnia", key: "app-movil" } },
      { ref: { slug: "turnia", key: "bot-portada" }, inset: { slug: "turnia", key: "bot-movil" } },
    ],
  },
  {
    slug: "vera",
    kind: "demo",
    hero: { main: { slug: "vera", key: "barberia-portada" }, video: { slug: "vera", key: "barberia-recorrido" } },
    variants: VERA_RUBROS.map((id) => ({
      id,
      media: { main: { slug: "vera", key: `${id}-portada` }, video: { slug: "vera", key: `${id}-recorrido` } },
    })),
  },
  {
    slug: "pipeline-ia",
    kind: "own-tool",
    hero: { main: { slug: "pipeline-ia", key: "portada" } },
    heroIllustrative: true,
    solution: [{ ref: { slug: "pipeline-ia", key: "galeria-01" }, illustrative: true }],
  },
];

export const CASE_SLUGS = cases.map((c) => c.slug);

export const caseBySlug = (slug: string) => cases.find((c) => c.slug === slug);

/** Postmortem del incidente de septiembre (contenido: messages `postmortem`). */
export const POSTMORTEM_SLUG = "incidente-sep-2026";

export const caseHref = (locale: string, slug: string) => `/${locale}/casos/${slug}`;
export const postmortemHref = (locale: string) => `/${locale}/postmortem/${POSTMORTEM_SLUG}`;
