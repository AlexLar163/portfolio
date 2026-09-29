"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { MediaFrame, type FrameProps } from "./MediaFrame";
import { useTabs } from "./tabs";

/**
 * Marco con miniaturas que cambian la imagen principal (3Destiny).
 * La primera miniatura es la portada: sin ella no habría forma de volver al recorrido.
 */
export function GalleryFrame({
  thumbLabel,
  galleryLabel,
  ...frame
}: Omit<FrameProps, "active" | "warm" | "onWarm"> & {
  thumbLabel: string;
  galleryLabel: string;
}) {
  const [active, setActive] = useState(0);
  const [warm, setWarm] = useState(false);
  const panelId = useId();
  const tabs = useTabs(frame.slides.length, active, (i) => {
    setWarm(true);
    setActive(i);
  });

  return (
    <div>
      <div id={panelId} role="tabpanel" aria-label={galleryLabel}>
        <MediaFrame {...frame} active={active} warm={warm} onWarm={() => setWarm(true)} />
      </div>
      {frame.slides.length > 1 && (
        <div
          className="thumbs"
          aria-label={galleryLabel}
          style={{ ["--n" as string]: frame.slides.length }}
          {...tabs.list}
        >
          {frame.slides.map((s, i) => (
            <button
              key={s.id}
              className="thumb"
              aria-label={thumbLabel.replace("{n}", String(i + 1))}
              {...tabs.tab(i, panelId)}
            >
              {s.image && <Image src={s.image.src} alt="" fill sizes="160px" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
