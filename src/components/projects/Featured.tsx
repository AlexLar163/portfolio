import { getTranslations } from "next-intl/server";
import { featured } from "@/data/showcase";
import type { MediaRef, Showcase } from "@/data/types";
import { resolveImage, resolveVideo } from "@/lib/media";
import { LabelTag, StatusBadge, TechList, TextLink } from "@/components/ui/primitives";
import { mediaText } from "@/components/media/text";
import { FeatureBody, type FeatureLayer, type FeatureStep, type LayerImage } from "./FeatureBody";

/** Los tres productos que se cuentan en partes (DISENO-v2 §9.1). */
export const FEATURED_IDS = ["turnia", "vera", "pipeline-ia"] as const;

const host = (url?: string) => (url ? new URL(url).host : undefined);

export async function Featured() {
  const t = await getTranslations("projects");
  const s = await getTranslations("status");
  const l = await getTranslations("labels");
  const c = await getTranslations("common");
  const m = await mediaText();

  const img = (ref: MediaRef, alt: string): LayerImage | undefined => {
    const r = resolveImage(ref);
    return r && { src: r.src, w: r.w, h: r.h, position: r.position, alt };
  };
  const nameOf = (p: Showcase) => (t.has(`items.${p.id}.name`) ? t(`items.${p.id}.name`) : p.name);

  /** Pasos + capas de cada producto. Todo el texto sale de messages (brief). */
  const story = (p: Showcase, name: string): { steps: FeatureStep[]; layers: FeatureLayer[] } => {
    if (p.parts) {
      type Part = { label: string; action: string; facts: string[] };
      const out = p.parts.map((part) => {
        const pt = t.raw(`items.${p.id}.parts.${part.id}`) as Part;
        const alt = `${name} · ${pt.label}`;
        const main = img(part.media.main, m.alt.alt(alt));
        const vid = resolveVideo(part.media.video);
        const inset = part.media.inset && img(part.media.inset, m.alt.altMobile(alt));
        const layer: FeatureLayer =
          vid && main
            ? { kind: "video", poster: main, video: { mp4: vid.mp4, webm: vid.webm } }
            : { kind: "image", image: main!, inset: inset || undefined };
        const step: FeatureStep = {
          id: part.id,
          title: pt.label,
          body: (
            <>
              <ul className="card__list">
                {pt.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p className="feature-step__link">
                <TextLink href={part.url} external newTabLabel={m.newTab}>
                  {pt.action}
                </TextLink>
              </p>
            </>
          ),
        };
        return { step, layer };
      });
      return { steps: out.map((o) => o.step), layers: out.map((o) => o.layer) };
    }

    type StepText = { title: string; text: string };
    const texts = t.raw(`items.${p.id}.steps`) as Record<string, StepText>;
    const steps: FeatureStep[] = Object.entries(texts).map(([id, st]) => ({
      id,
      title: st.title,
      body: <p className="ink-2">{st.text}</p>,
    }));

    if (p.variants) {
      // Vera: el recorrido de la barbería y luego los cuatro rubros armados en grilla.
      const first = p.variants[0];
      const poster = img(first.media.main, m.alt.alt(`${name} · ${t(`items.${p.id}.variants.${first.id}`)}`))!;
      const vid = resolveVideo(first.media.video);
      const tiles = p.variants
        .map((v) => img(v.media.main, m.alt.alt(`${name} · ${t(`items.${p.id}.variants.${v.id}`)}`)))
        .filter((x): x is LayerImage => !!x);
      return {
        steps,
        layers: [
          vid ? { kind: "video", poster, video: { mp4: vid.mp4, webm: vid.webm } } : { kind: "image", image: poster },
          { kind: "grid", tiles },
        ],
      };
    }

    // Pipeline: portada y galería.
    const refs: MediaRef[] = [p.media!.main, { slug: p.media!.main.slug, key: "galeria-01" }];
    return {
      steps,
      layers: refs.map((r, i) => ({ kind: "image", image: img(r, m.alt.altView(name, i + 1))! })),
    };
  };

  const items = FEATURED_IDS.map((id) => featured.find((p) => p.id === id)!).filter(Boolean);

  return (
    <section id="proyectos" aria-labelledby="proyectos-title" className="section featured">
      <div className="shell">
        <header className="section-head">
          <h2 id="proyectos-title" className="t-chapter rail-title" data-rail>
            {t("featuredTitle")}
          </h2>
          <p className="t-lead">{t("featuredLead")}</p>
        </header>

        {items.map((p) => {
          const name = nameOf(p);
          const { steps, layers } = story(p, name);
          const status = p.status ?? "internal";
          const address =
            host(p.url) ?? (status === "internal" ? s("internal").toLowerCase() : m.captures);
          return (
            <article key={p.id} className="feature" data-feature={p.id} aria-labelledby={`f-${p.id}`}>
              <header className="feature__head">
                <h3 id={`f-${p.id}`} className="feature__name">
                  {name}
                </h3>
                <p className="meta t-small feature__meta">
                  <LabelTag label={p.label} text={l(p.label)} />
                  <StatusBadge status={status} label={s(status)} />
                  <TechList items={p.tech} />
                </p>
                <p className="feature__line t-lead">{t(`items.${p.id}.summary`)}</p>
              </header>
              <FeatureBody
                name={name}
                steps={steps}
                layers={layers}
                address={address}
                status={{ status, label: s(status) }}
                labels={{
                  play: m.labels.play,
                  pause: m.labels.pause,
                  tabs: c("gallery", { name }),
                }}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
}
