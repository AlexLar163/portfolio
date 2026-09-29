import type { GalleryRef } from "@/data/types";
import { resolveGallery, type ImageAsset } from "@/lib/media";
import type { FrameImage, FrameSlide } from "./MediaFrame";

type Alt = {
  alt: (name: string) => string;
  altView: (name: string, n: number) => string;
  altMobile: (name: string) => string;
};

const toFrame = (img: ImageAsset | undefined, alt: string): FrameImage | undefined =>
  img && { src: img.src, w: img.w, h: img.h, fit: img.fit, position: img.position, alt };

/** Una diapositiva desde una galería (imagen principal + video + inset). */
export function slideFrom(
  id: string,
  ref: GalleryRef | undefined,
  slot: number,
  name: string,
  a: Alt,
): FrameSlide {
  const g = resolveGallery(ref, slot);
  return {
    id,
    image: toFrame(g.main, a.alt(name)),
    video: g.video && { mp4: g.video.mp4, webm: g.video.webm },
    inset: toFrame(g.inset, a.altMobile(name)),
  };
}

/** Diapositivas de una galería con miniaturas: portada + `items`. */
export function gallerySlides(
  id: string,
  ref: GalleryRef | undefined,
  slot: number,
  name: string,
  a: Alt,
): FrameSlide[] {
  const g = resolveGallery(ref, slot);
  const main = slideFrom(`${id}-main`, ref, slot, name, a);
  return [
    main,
    ...g.items.map((img, i) => ({
      id: `${id}-${i + 1}`,
      image: toFrame(img, a.altView(name, i + 2)),
    })),
  ];
}
