import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/header/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MotionRoot } from "@/motion/MotionRoot";

/**
 * Esqueleto de las subpáginas (casos, postmortem): el mismo que la home, así
 * la pista del circuito (circuit.ts) y su paquete recorren también estas
 * páginas — cada `[data-rail]` es un nodo y cada `.tb-pin`, un ramal.
 */
export async function SubPage({ children }: { children: ReactNode }) {
  const t = await getTranslations("nav");
  return (
    <>
      <a className="skip-link" href="#contenido">
        {t("skip")}
      </a>
      <MotionRoot />
      <div className="spotlight" aria-hidden="true" data-overflow-ok>
        <i />
      </div>
      <SiteHeader sub />
      <main id="contenido">
        <div className="circuit" aria-hidden="true" data-overflow-ok>
          <svg focusable="false" />
          <span className="circuit__pk" />
        </div>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

/** Ruta de navegación: Inicio › Casos › actual. */
export function Breadcrumb({ label, items }: { label: string; items: { href?: string; text: string }[] }) {
  return (
    <nav aria-label={label} className="crumbs t-small">
      <ol>
        {items.map((it, i) => (
          <li key={i}>
            {it.href ? (
              <a className="link" href={it.href}>
                {it.text}
              </a>
            ) : (
              <span aria-current="page">{it.text}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Sección de subpágina: titular en la pista del circuito. */
export function SubSection({
  id,
  title,
  children,
  className = "",
}: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`section sub-section ${className}`}>
      <div className="shell">
        <h2 id={`${id}-title`} className="t-h2 rail-title sub-section__title" data-rail>
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
