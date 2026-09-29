import type { ReactNode } from "react";

export function Section({
  id,
  title,
  lead,
  width = "default",
  canvas,
  children,
  after,
}: {
  id: string;
  title: string;
  lead?: ReactNode;
  width?: "default" | "wide";
  canvas?: boolean;
  children: ReactNode;
  /** Contenido extra bajo el lead (p. ej. la nota de «bajo pedido»). */
  after?: ReactNode;
}) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`section${canvas ? " section--canvas" : ""}`}
    >
      <div className={`shell${width === "wide" ? " shell--wide" : ""}`}>
        <header className="section-head">
          <h2 id={headingId} className="t-h2">
            {title}
          </h2>
          {lead && <p className="t-lead">{lead}</p>}
          {after}
        </header>
        {children}
      </div>
    </section>
  );
}
