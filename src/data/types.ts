import type { DemoId } from "./status";

/**
 * Modelo de datos del portfolio.
 *
 * Los datos estructurales (ids, URLs, stack, estado, media, cajas del diagrama)
 * viven en `src/data/*.ts`. Los TEXTOS visibles viven en `messages/{es,en}.json`,
 * indexados por el mismo `id`, para que traducir no obligue a tocar código.
 */

export type Status =
  | "production"
  | "live"
  | "in-progress"
  | "on-demand"
  | "captures-only"
  | "internal";

export type ShowcaseLabel = "demo" | "own-tool" | "personal" | "previous";

/** Referencia a una pieza de `public/media/manifest.json` (slug → clave). */
export interface MediaRef {
  slug: string;
  key: string;
  fit?: "cover" | "contain";
  /** object-position, p. ej. "top" */
  position?: string;
}

export interface GalleryRef {
  main: MediaRef;
  /** Recorrido en video (se reproduce solo si pasa la regla de 0,8 × slot). */
  video?: MediaRef;
  /** Miniaturas que cambian la media principal (3Destiny). */
  items?: MediaRef[];
  /** Vista móvil superpuesta. */
  inset?: MediaRef;
}

export interface Client {
  id: string;
  name: string;
  domain?: string;
  url?: string;
  year: string;
  status: "production" | "in-progress";
  tech: string[];
  media?: GalleryRef;
  review?: { source: "Workana"; stars: 5 };
  /** Diamante: el demo que ganó el proyecto. */
  demoUrl?: string;
  /** 3Destiny → ClientCase. */
  lead?: boolean;
}

export interface Showcase {
  id: string;
  name: string;
  label: ShowcaseLabel;
  tier: "featured" | "other";
  order: number;
  size?: "feature" | "half" | "third";
  group?: "woocommerce" | "wordpress" | "nextjs" | "personal" | "previous";
  year: string;
  tech: string[];
  /** Sin estado: trabajos anteriores que ya no están publicados. */
  status?: Status;
  url?: string;
  /** Texto de la barra de dirección cuando hay destino. */
  domain?: string;
  repo?: string;
  media?: GalleryRef;
  /** Turnia: Landing · App · Bot. Textos en messages. */
  parts?: { id: "landing" | "app" | "bot"; media: GalleryRef; url: string }[];
  /** Vera: 4 rubros. */
  variants?: { id: string; media: GalleryRef }[];
  /**
   * Demo del taller (`on-demand`): id del sitio en /api/status
   * (src/data/status.ts → TALLER_DEMOS). El CTA se resuelve en el cliente:
   * «Ver en vivo» si responde, «Bajo pedido · Pedirla» si no o mientras mide.
   */
  liveSlug?: DemoId;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Point = [number, number];

export interface InfraNode {
  id: string;
  kind: "external" | "service" | "on-demand" | "boundary" | "strip" | "cloud";
  /** Orden de aparición en la escena DevOps (DISENO-v2 §5.3, fase «armado»). */
  group: "external" | "dns" | "frame" | "vps" | "caddy" | "docker" | "cloud";
  land: Box;
  port: Box;
  /** Nodos que no se seleccionan (fronteras). */
  interactive: boolean;
}

export interface InfraEdge {
  id: string;
  from: string;
  to: string;
  type: "traffic" | "control" | "scheduled";
  land: Point[];
  port: Point[];
  /** Posición de la etiqueta visible, si la tiene. */
  labelLand?: { x: number; y: number; anchor: "start" | "middle" | "end"; lines?: boolean };
  labelPort?: { x: number; y: number; anchor: "start" | "middle" | "end" };
}

export interface InfraRoute {
  id: 1 | 2;
  /** Aristas que se resaltan al trazar este recorrido. */
  edges: string[];
  land: Point[];
  port: Point[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  /** "2026-01"; sin `end` = actualidad. */
  start: string;
  end?: string;
  parallelWith?: string;
  tech?: string[];
}

export interface SkillCategory {
  id: string;
  tools: string[];
}

export interface Social {
  id: "github" | "linkedin" | "email";
  label: string;
  handle: string;
  href: string;
}
