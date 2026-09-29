import fs from "node:fs";
import path from "node:path";
import type { GalleryRef, MediaRef } from "@/data/types";

/**
 * Resolución de media en build. La fuente de rutas es `public/media/manifest.json`
 * (lo genera el pipeline de media). Cada pieza se comprueba en disco: si falta,
 * el componente pinta el placeholder sobrio en vez de un marco roto.
 */

export interface ImageAsset {
  kind: "image";
  src: string;
  w: number;
  h: number;
  fit: "cover" | "contain";
  position?: string;
}

export interface VideoAsset {
  kind: "video";
  mp4?: string;
  webm?: string;
  w: number;
  h: number;
  seconds?: number;
}

export interface ResolvedGallery {
  main?: ImageAsset;
  video?: VideoAsset;
  items: ImageAsset[];
  inset?: ImageAsset;
}

interface ManifestEntry {
  src?: string;
  mp4?: string;
  webm?: string;
  poster?: string;
  w: number;
  h: number;
  seconds?: number;
}

const PUBLIC = path.join(process.cwd(), "public");
let manifest: Record<string, Record<string, ManifestEntry>> | null = null;

function load() {
  if (manifest) return manifest;
  try {
    manifest = JSON.parse(
      fs.readFileSync(path.join(PUBLIC, "media", "manifest.json"), "utf8"),
    );
  } catch {
    manifest = {};
  }
  return manifest!;
}

const exists = (url?: string) =>
  !!url && fs.existsSync(path.join(PUBLIC, url.replace(/^\//, "")));

function entry(ref: MediaRef): ManifestEntry | undefined {
  const e = load()[ref.slug]?.[ref.key];
  return e && typeof e === "object" ? e : undefined;
}

export function resolveImage(ref?: MediaRef): ImageAsset | undefined {
  if (!ref) return undefined;
  const e = entry(ref);
  if (!e?.src || !exists(e.src)) return undefined;
  return {
    kind: "image",
    src: e.src,
    w: e.w,
    h: e.h,
    fit: ref.fit ?? "cover",
    position: ref.position,
  };
}

export function resolveVideo(ref?: MediaRef): VideoAsset | undefined {
  if (!ref) return undefined;
  const e = entry(ref);
  if (!e) return undefined;
  const mp4 = exists(e.mp4) ? e.mp4 : undefined;
  const webm = exists(e.webm) ? e.webm : undefined;
  if (!mp4 && !webm) return undefined;
  return { kind: "video", mp4, webm, w: e.w, h: e.h, seconds: e.seconds };
}

/**
 * Regla de DISENO §5.2: el video solo se reproduce si su ancho es ≥ 0,8 × el
 * slot. Si no, se ve borroso junto a su propio póster y se queda la imagen fija.
 */
export function resolveGallery(
  ref: GalleryRef | undefined,
  slotWidth: number,
): ResolvedGallery {
  if (!ref) return { items: [] };
  const video = resolveVideo(ref.video);
  return {
    main: resolveImage(ref.main),
    video: video && video.w >= 0.8 * slotWidth ? video : undefined,
    items: (ref.items ?? [])
      .map((r) => resolveImage(r))
      .filter((x): x is ImageAsset => !!x),
    inset: resolveImage(ref.inset),
  };
}

/** Peso real de un archivo de /public (CV), o null si todavía no existe. */
export function fileBytes(url: string): number | null {
  try {
    return fs.statSync(path.join(PUBLIC, url.replace(/^\//, ""))).size;
  } catch {
    return null;
  }
}

/** Anchos de slot en 1440 (DISENO §5.2). */
export const SLOT = {
  feature: 784,
  half: 656,
  third: 432,
} as const;

export const SIZES = {
  feature: "(min-width: 1440px) 784px, (min-width: 900px) 56vw, 100vw",
  half: "(min-width: 1440px) 656px, (min-width: 900px) 46vw, 100vw",
  third:
    "(min-width: 1440px) 432px, (min-width: 900px) 30vw, (min-width: 600px) 46vw, 100vw",
  thumb: "160px",
  index: "128px",
  capture: "(min-width: 1440px) 440px, (min-width: 900px) 32vw, 100vw",
  inset: "180px",
} as const;
