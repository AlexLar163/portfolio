import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { featured, indexGroups } from "@/data/showcase";
import type { Showcase } from "@/data/types";
import { resolveImage, SIZES, SLOT } from "@/lib/media";
import { Section } from "@/components/ui/Section";
import { LabelTag, StatusBadge, TechList, TextLink } from "@/components/ui/primitives";
import { MediaFrame } from "@/components/media/MediaFrame";
import { VariantCard } from "@/components/media/VariantFrame";
import { slideFrom } from "@/components/media/build";
import { mediaText } from "@/components/media/text";
import { ProjectFeature } from "./ProjectFeature";
import { DemoRequestLink } from "./DemoRequestLink";

const host = (url?: string) => (url ? new URL(url).host : undefined);

export async function Projects() {
  const t = await getTranslations("projects");
  const s = await getTranslations("status");
  const l = await getTranslations("labels");
  const c = await getTranslations("common");
  const m = await mediaText();

  const nameOf = (p: Showcase) =>
    t.has(`items.${p.id}.name`) ? t(`items.${p.id}.name`) : p.name;
  const highlights = (p: Showcase) =>
    t.has(`items.${p.id}.highlights`) ? (t.raw(`items.${p.id}.highlights`) as string[]).slice(0, 3) : [];

  const meta = (p: Showcase) => (
    <p className="meta t-small">
      <LabelTag label={p.label} text={l(p.label)} />
      <span>{p.tech[0]}</span>
      <span className="t-data">{p.year}</span>
    </p>
  );

  /** Acción según el estado: en vivo → enlace; bajo pedido → «Pedirla». */
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
    if (p.repo)
      return (
        <TextLink href={p.repo} external newTabLabel={m.newTab}>
          {c("viewCode")}
        </TextLink>
      );
    return null;
  };

  const frameBase = (p: Showcase, name: string, size: "half" | "third") => ({
    name,
    address: host(p.url) ?? m.captures,
    status: p.status ? { status: p.status, label: s(p.status) } : undefined,
    sizes: SIZES[size],
    placeholder: name,
    labels: m.labels,
  });

  const card = (p: Showcase, extra = "") => {
    const name = nameOf(p);
    const size = p.size === "third" ? "third" : "half";
    const hl = highlights(p);
    const className = `card card--${size} ${extra}`;
    const labelledBy = `p-${p.id}`;
    const head = (
      <>
        <h3 id={labelledBy} className="t-h3">
          {name}
        </h3>
        {meta(p)}
        <p className="card__summary">{t(`items.${p.id}.summary`)}</p>
      </>
    );
    const tail = (
      <>
        {hl.length > 0 && (
          <ul className="card__list">
            {hl.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}
        <TechList items={p.tech} />
        <div className="card__actions">{action(p, name)}</div>
      </>
    );

    if (p.variants) {
      const label = (id: string) => t(`items.${p.id}.variants.${id}`);
      return (
        <VariantCard
          key={p.id}
          className={className}
          labelledBy={labelledBy}
          head={head}
          tail={tail}
          {...frameBase(p, name, size)}
          slides={p.variants.map((v) => slideFrom(v.id, v.media, SLOT[size], `${name} · ${label(v.id)}`, m.alt))}
          variantLabels={p.variants.map((v) => label(v.id))}
          groupLabel={t("variantsLabel")}
        />
      );
    }

    return (
      <article key={p.id} className={className} aria-labelledby={labelledBy}>
        <div className="card__media">
          <MediaFrame {...frameBase(p, name, size)} slides={[slideFrom(p.id, p.media, SLOT[size], name, m.alt)]} />
        </div>
        <div className="card__body">
          {head}
          {tail}
        </div>
      </article>
    );
  };

  const turnia = featured.find((p) => p.size === "feature")!;
  const rest = featured.filter((p) => p !== turnia);
  const rows = [rest.slice(0, 2), rest.slice(2, 5), rest.slice(5, 7)];

  type PartText = { label: string; action: string; facts: string[] };
  const partText = (id: string) => t.raw(`items.turnia.parts.${id}`) as PartText;

  return (
    <Section
      id="proyectos"
      title={t("title")}
      lead={t("lead")}
      after={
        <p className="projects-note t-small">
          <span>
            {t("note")}{" "}
            <a href="#contacto" className="link">
              {t("noteLink")}
            </a>
            .
          </span>
        </p>
      }
    >
      <ProjectFeature
        name={turnia.name}
        meta={meta(turnia)}
        summary={t("items.turnia.summary")}
        tech={turnia.tech.join(" · ")}
        partsLabel={t("partsLabel")}
        newTab={m.newTab}
        parts={turnia.parts!.map((p) => ({ id: p.id, url: p.url, ...partText(p.id) }))}
        frame={{
          name: turnia.name,
          address: host(turnia.url)!,
          status: { status: "live", label: s("live") },
          sizes: SIZES.feature,
          placeholder: turnia.name,
          labels: m.labels,
          slides: turnia.parts!.map((p) =>
            slideFrom(p.id, p.media, SLOT.feature, `${turnia.name} · ${partText(p.id).label}`, m.alt),
          ),
        }}
      />

      {rows.map((row, i) => (
        <div key={i} className="grid cards">
          {row.map((p, j) => card(p, row.length === 3 && j === 2 ? "card--row-md" : ""))}
        </div>
      ))}

      {/* Índice denso de «Otros» */}
      <div className="index">
        <h3 className="subhead">{t("indexTitle")}</h3>
        {indexGroups.map((g) => (
          <section key={g.id} className="index__group" aria-labelledby={`ix-${g.id}`}>
            <h4 id={`ix-${g.id}`} className="index__title t-small ink-3">
              {t(`groups.${g.id}`)}
            </h4>
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
    </Section>
  );
}
