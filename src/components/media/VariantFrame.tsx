"use client";

import { useId, useState, type ReactNode } from "react";
import { MediaFrame, type FrameProps } from "./MediaFrame";
import { useTabs } from "./tabs";

/**
 * Tarjeta con rubros (Vera). El control segmentado va en el cuerpo, bajo el
 * resumen —como en Turnia—, para que el marco quede a la misma altura que el de
 * la tarjeta vecina.
 */
export function VariantCard({
  variantLabels,
  groupLabel,
  className,
  labelledBy,
  head,
  tail,
  ...frame
}: Omit<FrameProps, "active" | "warm" | "onWarm"> & {
  variantLabels: string[];
  groupLabel: string;
  className: string;
  labelledBy: string;
  head: ReactNode;
  tail: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const [warm, setWarm] = useState(false);
  const panelId = useId();
  const tabs = useTabs(frame.slides.length, active, (i) => {
    setWarm(true);
    setActive(i);
  });

  return (
    <article className={className} aria-labelledby={labelledBy}>
      <div className="card__media" id={panelId} role="tabpanel" aria-label={variantLabels[active]}>
        <MediaFrame {...frame} active={active} warm={warm} onWarm={() => setWarm(true)} />
      </div>
      <div className="card__body">
        {head}
        <div className="segment" aria-label={groupLabel} {...tabs.list}>
          {variantLabels.map((label, i) => (
            <button key={label} {...tabs.tab(i, panelId)}>
              {label}
            </button>
          ))}
        </div>
        {tail}
      </div>
    </article>
  );
}
