import { TraceBox } from "@/components/ui/TraceBox";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { featured, indexGroups, showcase } from "@/data/showcase";
import type { Showcase } from "@/data/types";
import { resolveImage, SIZES, SLOT } from "@/lib/media";
import { LabelTag, StatusBadge, TechList, TextLink } from "@/components/ui/primitives";
import { MediaFrame } from "@/components/media/MediaFrame";
import { slideFrom } from "@/components/media/build";
import { mediaText } from "@/components/media/text";
import { DemoRequestLink } from "./DemoRequestLink";
import { FEATURED_IDS } from "./Featured";
import { PauseToggle } from "@/components/ui/PauseToggle";

const host = (url?: string) => (url ? new URL(url).host : undefined);

/**
 * Más demos (fila de 5) + Otros (marquee de portadas + índice plegado).
 * Quietas a propósito: el contraste de densidad es lo que hace sentir el showcase.
 */
export async function MoreProjects() {
  const t = await getTranslations("projects");
  const s = await getTranslations("status");
  const l = await getTranslations("labels");
  const c = await getTranslations("common");
  const m = await mediaText();

  const nameOf = (p: Showcase) => (t.has(`items.${p.id}.name`) ? t(`items.${p.id}.name`) : p.name);
  const demos = featured.filter((p) => !(FEATURED_IDS as readonly string[]).includes(p.id));
  const others = showcase.filter((p) => p.tier === "other");
  // Portadas apaisadas para el marquee (la de FinansFit es vertical).
  const covers = others
    .map((p) => ({ p, img: resolveImage(p.media?.main) }))
    .filter((x) => x.img && x.img.w / x.img.h > 1.3);
  const half = Math.ceil(covers.length / 2);
  const rows = [covers.slice(0, half), covers.slice(half)];
  const STATIC_N = 6;

  /** Acción según el estado: en vivo → enlace; bajo pedido → «Pedirla» (nunca «Ver en vivo»). */
  const action = (p: Showcase, name: string) => {
    if (p.status === "live" && p.url)
      return (
        <TextLink href={p.url} external newTabLabel={m.newTab}>
          {c("viewLive")}
        </TextLink>
      );
    if (p.status === "on-demand")
      return (
        <span className="on-demand t-small">
          {c("onDemandNote")}
          <DemoRequestLink label={c("requestDemo")} message={c("requestPrefill", { name })} />
        </span>
      );
    return null;
  };

  return (
    <section id="mas-proyectos" data-nav="proyectos" aria-labelledby="mas-title" className="section more">
      <div className="shell">
        <header className="section-head">
          <h2 id="mas-title" className="t-h2 rail-title" data-rail>
            {t("moreTitle")}
          </h2>
          <p className="projects-note t-small">
            <span>
              {t("note")}{" "}
              <a href="#contacto" className="link">
                {t("noteLink")}
              </a>
              .
            </span>
          </p>
        </header>

        <ul className="demo-row">
          {demos.map((p, i) => {
            const name = nameOf(p);
            return (
              <li key={p.id}>
                <article className="demo-card spot" data-reveal aria-labelledby={`d-${p.id}`}>
                  <TraceBox i={i} />
                  <div className="demo-card__media">
                    <MediaFrame
                      name={name}
                      address={host(p.url) ?? m.captures}
                      sizes={SIZES.third}
                      placeholder={name}
                      labels={m.labels}
                      slides={[slideFrom(p.id, p.media, SLOT.third, name, m.alt)]}
                    />
                  </div>
                  <div className="demo-card__body">
                    <h3 id={`d-${p.id}`} className="demo-card__name">
                      {name}
                    </h3>
                    <p className="meta t-small">
                      <LabelTag label={p.label} text={l(p.label)} />
                      <span>{p.tech[0]}</span>
                    </p>
                    <p className="demo-card__line t-small">{t(`items.${p.id}.summary`)}</p>
                    <div className="demo-card__foot">
                      {p.status && <StatusBadge status={p.status} label={s(p.status)} />}
                      {action(p, name)}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        <div className="others">
          <div className="others__head">
            <h2 className="t-h2">{t("othersTitle")}</h2>
            <PauseToggle target=".others" pauseLabel={t("pauseCovers")} playLabel={t("playCovers")} />
          </div>

          {/* Marquee (solo con motion): decorativo, la información está en el índice. */}
          <div className="marquee" aria-hidden="true" data-overflow-ok data-inview>
            {rows.map((row, r) => (
              <div key={r} className={`marquee__row marquee__row--${r % 2 ? "rev" : "fwd"}`}>
                {[0, 1].map((copy) => (
                  <div key={copy} className="marquee__track">
                    {row.map(({ p, img }) => (
                      <div key={`${p.id}-${copy}`} className="marquee__item">
                        <Image src={img!.src} alt="" fill sizes="240px" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Con reduce, sin JS o ?motion=0: grilla estática de 6 y +n. */}
          <ul className="others__grid" aria-hidden="true">
            {covers.slice(0, STATIC_N).map(({ p, img }) => (
              <li key={p.id} className="others__tile">
                <Image src={img!.src} alt="" fill sizes="(min-width: 900px) 200px, 30vw" />
              </li>
            ))}
            <li className="others__tile others__tile--more t-data">
              {t("moreCount", { n: others.length - STATIC_N })}
            </li>
          </ul>

          <details className="disclosure index">
            <summary>{t("showAll", { n: others.length })}</summary>
            <div className="disclosure__body">
              <div className="disclosure__inner">
                {indexGroups.map((g) => (
                  <section key={g.id} className="index__group" aria-labelledby={`ix-${g.id}`}>
                    <h3 id={`ix-${g.id}`} className="index__title t-small ink-3">
                      {t(`groups.${g.id}`)}
                    </h3>
                    <ul className="index__rows">
                      {g.items.map((p) => {
                        const name = nameOf(p);
                        const img = resolveImage(p.media?.main);
                        const linked = p.status === "live" && !!p.url;
                        const inner = (
                          <>
                            <div className={`row__thumb${img?.fit === "contain" ? " row__thumb--contain" : ""}`}>
                              {img ? (
                                <Image src={img.src} alt="" fill sizes={SIZES.index} />
                              ) : (
                                <span className="row__band t-data-sm">{name}</span>
                              )}
                            </div>
                            <div className="row__rest">
                              <div className="row__main">
                                <p className="row__name">
                                  {name}
                                  {p.label === "demo" && <LabelTag label={p.label} text={l(p.label)} />}
                                </p>
                                <p className="row__desc t-small">{t(`items.${p.id}.summary`)}</p>
                              </div>
                              <div className="row__stack">
                                <TechList items={p.tech} max={3} />
                              </div>
                              <div className="row__status">
                                {p.status && <StatusBadge status={p.status} label={s(p.status)} />}
                                {linked ? (
                                  <span className="row__cta t-small">
                                    {c("viewLive")}
                                    <ArrowUpRight className="link__icon" strokeWidth={1.5} aria-hidden />
                                    <span className="sr-only"> {m.newTab}</span>
                                  </span>
                                ) : p.status === "on-demand" ? (
                                  <DemoRequestLink label={c("requestDemo")} message={c("requestPrefill", { name })} />
                                ) : p.repo ? (
                                  <TextLink href={p.repo} external newTabLabel={m.newTab} className="t-small">
                                    {c("viewCode")}
                                  </TextLink>
                                ) : (
                                  !p.status && <span className="t-data ink-3">{p.year}</span>
                                )}
                              </div>
                            </div>
                          </>
                        );
                        return (
                          <li key={p.id}>
                            {linked ? (
                              <a className="row row-link" href={p.url} target="_blank" rel="noopener noreferrer">
                                {inner}
                              </a>
                            ) : (
                              <div className="row">{inner}</div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
