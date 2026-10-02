import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { caseHref, cases, type CaseDef, type CaseFigure } from "@/data/cases";
import type { MediaRef } from "@/data/types";
import { resolveImage, SIZES, SLOT } from "@/lib/media";
import { TextLink } from "@/components/ui/primitives";
import { TraceBox } from "@/components/ui/TraceBox";
import { MediaFrame } from "@/components/media/MediaFrame";
import { GalleryFrame } from "@/components/media/GalleryFrame";
import { slideFrom } from "@/components/media/build";
import { mediaText } from "@/components/media/text";
import { Breadcrumb, SubPage, SubSection } from "./SubPage";
import { Flow } from "./Flow";

export type CaseText = {
  name: string;
  title: string;
  subtitle: string;
  summary: string;
  context: string[];
  solution: string[];
  pieces: string[];
  flowTitle?: string;
  flow: string[];
  decisions: { title: string; text: string; tradeoff: string }[];
  results: string[];
  resultsNote?: string;
  stack: string[];
  links: { label: string; href: string }[];
  linksNote?: string;
  figures?: Record<string, string>;
  variants?: Record<string, string>;
  solutionParts?: Record<string, string>;
};

type Ui = {
  breadcrumb: string;
  home: string;
  cases: string;
  context: string;
  solution: string;
  architecture: string;
  decisions: string;
  results: string;
  stack: string;
  links: string;
  pieces: string;
  flowLabel: string;
  tradeoff: string;
  prev: string;
  next: string;
  more: string;
  backHome: string;
  illustrative: string;
  pauseFlow: string;
  playFlow: string;
  kind: Record<string, string>;
};

/** Caso de estudio (contenido: messages `cases.items.<slug>`, de _insumos/CASOS.md). */
export async function CasePage({ def, locale }: { def: CaseDef; locale: string }) {
  const t = await getTranslations("cases");
  const s = await getTranslations("status");
  const c = await getTranslations("common");
  const m = await mediaText();
  const ui = t.raw("ui") as Ui;
  const item = t.raw(`items.${def.slug}`) as CaseText;
  const home = `/${locale}`;
  const address = def.address ?? m.captures;
  const caption = (ref: MediaRef) => item.figures?.[ref.key] ?? item.name;

  /** Una figura del caso: el mismo marco que la home (barra con dirección), con su pie. */
  const figure = (f: CaseFigure, i: number, sizes: string = SIZES.half) => {
    const img = resolveImage(f.ref);
    if (!img) return null;
    const inset = resolveImage(f.inset);
    const alt = caption(f.ref);
    return (
      <figure key={`${f.ref.key}-${i}`} className="case-fig">
        <MediaFrame
          name={item.name}
          address={address}
          sizes={sizes}
          placeholder={item.name}
          labels={m.labels}
          slides={[
            {
              id: f.ref.key,
              image: { src: img.src, w: img.w, h: img.h, fit: img.fit, alt },
              inset: inset && {
                src: inset.src,
                w: inset.w,
                h: inset.h,
                fit: inset.fit,
                alt: f.inset ? caption(f.inset) : m.alt.altMobile(item.name),
              },
            },
          ]}
        />
        <figcaption className="case-fig__cap t-small">
          {alt}
          {f.illustrative && <span className="case-fig__note"> · {ui.illustrative}</span>}
        </figcaption>
      </figure>
    );
  };

  // Cabecera: recorrido en video (o imagen); Vera, sus cuatro rubros en un selector.
  const heroMedia = def.variants ? (
    <GalleryFrame
      name={item.name}
      address={address}
      sizes={SIZES.feature}
      placeholder={item.name}
      labels={m.labels}
      priority
      slides={def.variants.map((v) =>
        slideFrom(v.id, v.media, SLOT.feature, `${item.name} · ${item.variants?.[v.id] ?? v.id}`, m.alt),
      )}
      thumbLabel={c.raw("view").replace("{name}", item.name)}
      galleryLabel={c("gallery", { name: item.name })}
    />
  ) : (
    <MediaFrame
      name={item.name}
      address={address}
      sizes={SIZES.feature}
      placeholder={item.name}
      labels={m.labels}
      priority
      status={def.kind === "client" ? { status: "production", label: s("production") } : undefined}
      slides={[slideFrom(def.slug, def.hero, SLOT.feature, item.name, m.alt)]}
    />
  );

  const idx = cases.findIndex((x) => x.slug === def.slug);
  const prev = cases[(idx - 1 + cases.length) % cases.length];
  const next = cases[(idx + 1) % cases.length];
  const nameOf = (slug: string) => (t.raw(`items.${slug}.name`) as string) ?? slug;

  return (
    <SubPage>
      <article aria-labelledby="inicio-title">
        <section id="inicio" className="case-hero" aria-labelledby="inicio-title">
          <div className="shell">
            <Breadcrumb
              label={ui.breadcrumb}
              items={[{ href: home, text: ui.home }, { href: `${home}#proyectos`, text: ui.cases }, { text: item.name }]}
            />
            <div className="grid case-hero__grid">
              <header className="case-hero__text">
                <p className="case-hero__tags">
                  <span className={`tag${def.kind === "demo" ? " tag--demo" : ""}`}>{ui.kind[def.kind]}</span>
                </p>
                <h1 id="inicio-title" className="t-h2 case-hero__title" data-rail>
                  {item.title}
                </h1>
                <p className="t-lead case-hero__sub">{item.subtitle}</p>
                <p className="case-hero__summary ink-2">{item.summary}</p>
                {item.links.length > 0 ? (
                  <ul className="case-links" aria-label={ui.links}>
                    {item.links.map((l) => (
                      <li key={l.href}>
                        <TextLink href={l.href} external newTabLabel={m.newTab}>
                          {l.label}
                        </TextLink>
                      </li>
                    ))}
                  </ul>
                ) : (
                  item.linksNote && <p className="t-small ink-3 case-links__note">{item.linksNote}</p>
                )}
              </header>
              <div className="case-hero__media">
                {heroMedia}
                {def.heroIllustrative && <p className="case-fig__cap t-small">{ui.illustrative}</p>}
              </div>
            </div>
          </div>
        </section>

        <SubSection id="contexto" title={ui.context}>
          <div className={`grid case-split${def.context?.length ? "" : " case-split--text"}`}>
            <div className="case-prose">
              {item.context.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {def.context?.map((f, i) => figure(f, i))}
          </div>
        </SubSection>

        <SubSection id="solucion" title={ui.solution}>
          <div className="case-prose case-prose--wide">
            {item.solution.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {def.solution && def.solution.length > 0 && (
            <div className={`case-figs case-figs--${Math.min(def.solution.length, 3)}`}>
              {def.solution.map((f, i) => figure(f, i, def.solution!.length > 2 ? SIZES.third : SIZES.half))}
            </div>
          )}
        </SubSection>

        <SubSection id="arquitectura" title={ui.architecture}>
          <div className="grid case-arch">
            <Flow
              id={`flow-${def.slug}`}
              label={ui.flowLabel.replace("{n}", String(item.flow.length))}
              title={item.flowTitle}
              steps={item.flow}
              pause={ui.pauseFlow}
              play={ui.playFlow}
            />
            <div className="case-pieces">
              <h3 className="subhead">{ui.pieces}</h3>
              <ul className="card__list">
                {item.pieces.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </SubSection>

        <SubSection id="decisiones" title={ui.decisions}>
          <ol className="decisions">
            {item.decisions.map((d, i) => (
              <li key={d.title} className="decision">
                <span className="decision__n t-data" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="decision__body">
                  <h3 className="t-h3">{d.title}</h3>
                  <p className="ink-2">{d.text}</p>
                  <p className="decision__trade t-small">
                    <span className="decision__tag">{ui.tradeoff}</span> {d.tradeoff}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </SubSection>

        <SubSection id="resultados" title={ui.results}>
          <div className={`grid case-split${def.results?.length ? "" : " case-split--text"}`}>
            <div>
              <ul className="case-results">
                {item.results.map((r) => (
                  <li key={r}>
                    <Check className="case-results__check" size={16} strokeWidth={2} aria-hidden />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              {item.resultsNote && <p className="notice notice--plain case-results__note">{item.resultsNote}</p>}
              <h3 className="subhead case-stack__title">{ui.stack}</h3>
              <ul className="case-stack" aria-label={ui.stack}>
                {item.stack.map((x) => (
                  <li key={x} className="tag">
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            {def.results?.map((f, i) => figure(f, i))}
          </div>
        </SubSection>
      </article>

      <nav className="section case-nav" aria-label={ui.more}>
        <div className="shell">
          <ul className="case-nav__list">
            {[
              { def: prev, rel: "prev", label: ui.prev, Icon: ArrowLeft },
              { def: next, rel: "next", label: ui.next, Icon: ArrowRight },
            ].map(({ def: d, rel, label, Icon }, i) => (
              <li key={rel} className={`case-nav__item case-nav__item--${rel}`}>
                <a className="case-nav__card" href={caseHref(locale, d.slug)} rel={rel}>
                  <TraceBox i={i} pin={false} />
                  <span className="t-small ink-3 case-nav__dir">
                    {rel === "prev" && <Icon size={16} strokeWidth={1.5} aria-hidden />}
                    {label}
                    {rel === "next" && <Icon size={16} strokeWidth={1.5} aria-hidden />}
                  </span>
                  <span className="case-nav__name">{nameOf(d.slug)}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="case-nav__end t-small">
            <a className="link" href={home}>
              <ArrowLeft className="link__icon" size={16} strokeWidth={1.5} aria-hidden />
              {ui.backHome}
            </a>
          </p>
        </div>
      </nav>
    </SubPage>
  );
}
