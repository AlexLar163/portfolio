"use client";

import { useId, useState, type ReactNode } from "react";
import { MediaFrame, type FrameProps } from "@/components/media/MediaFrame";
import { useTabs } from "@/components/media/tabs";
import { TextLink } from "@/components/ui/primitives";

type Part = { id: string; label: string; facts: string[]; action: string; url: string };

/** Turnia a ancho completo, con selector «Landing · App · Bot» (DISENO §3.4). */
export function ProjectFeature({
  frame,
  parts,
  name,
  meta,
  summary,
  tech,
  partsLabel,
  newTab,
}: {
  frame: Omit<FrameProps, "active" | "warm" | "onWarm">;
  parts: Part[];
  name: string;
  meta: ReactNode;
  summary: string;
  tech: string;
  partsLabel: string;
  newTab: string;
}) {
  const [active, setActive] = useState(0);
  const [warm, setWarm] = useState(false);
  const panelId = useId();
  const mediaId = useId();
  const tabs = useTabs(parts.length, active, (i) => {
    setWarm(true);
    setActive(i);
  });
  const part = parts[active];

  return (
    <article className="grid feature" aria-labelledby="feature-turnia">
      <div className="feature__media" id={mediaId}>
        <MediaFrame {...frame} active={active} warm={warm} onWarm={() => setWarm(true)} />
      </div>
      <div className="feature__text">
        <h3 id="feature-turnia" className="t-h3">
          {name}
        </h3>
        {meta}
        <p className="card__summary">{summary}</p>
        <div className="segment" aria-label={partsLabel} {...tabs.list}>
          {parts.map((p, i) => (
            <button key={p.id} {...tabs.tab(i, panelId)}>
              {p.label}
            </button>
          ))}
        </div>
        <div id={panelId} role="tabpanel" aria-label={part.label}>
          <ul className="card__list feature__facts" key={part.id}>
            {part.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <p className="tech t-data">{tech}</p>
        <div className="card__actions">
          {parts.map((p) => (
            <TextLink key={p.id} href={p.url} external newTabLabel={newTab}>
              {p.action}
            </TextLink>
          ))}
        </div>
      </div>
    </article>
  );
}
