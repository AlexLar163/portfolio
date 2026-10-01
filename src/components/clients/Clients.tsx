import { getTranslations } from "next-intl/server";
import { clients } from "@/data/clients";
import type { Client } from "@/data/types";
import { SIZES, SLOT } from "@/lib/media";
import { StatusBadge, TextLink } from "@/components/ui/primitives";
import { MediaFrame } from "@/components/media/MediaFrame";
import { GalleryFrame } from "@/components/media/GalleryFrame";
import { gallerySlides, slideFrom } from "@/components/media/build";
import { mediaText } from "@/components/media/text";
import { TraceBox } from "@/components/ui/TraceBox";

/**
 * Clientes (DISENO-v2 §8, v3): un cliente por bloque, con media grande, en
 * flujo normal (sin pila fija). En desktop la media alterna de lado.
 */
export async function Clients() {
  const t = await getTranslations("clients");
  const s = await getTranslations("status");
  const c = await getTranslations("common");
  const m = await mediaText();

  const media = (cl: Client) => {
    const frame = {
      name: cl.name,
      address: cl.domain ?? m.captures,
      status: { status: cl.status, label: s(cl.status) },
      sizes: SIZES.feature,
      placeholder: cl.name,
      labels: m.labels,
    };
    if (cl.media?.items?.length) {
      return (
        <GalleryFrame
          {...frame}
          slides={gallerySlides(cl.id, cl.media, SLOT.feature, cl.name, m.alt)}
          thumbLabel={c.raw("view").replace("{name}", cl.name)}
          galleryLabel={c("gallery", { name: cl.name })}
        />
      );
    }
    return <MediaFrame {...frame} slides={[slideFrom(cl.id, cl.media, SLOT.feature, cl.name, m.alt)]} />;
  };

  return (
    <section id="clientes" aria-labelledby="clientes-title" className="section clients">
      <div className="shell">
        <header className="section-head">
          <h2 id="clientes-title" className="t-chapter rail-title" data-rail>
            {t("title")}
          </h2>
          <p className="t-lead">{t("lead")}</p>
        </header>

        <div className="client-stack">
          {clients.map((cl, i) => {
            const k = `items.${cl.id}`;
            const hasReview = !!cl.review && t.has(`${k}.review.quote`);
            return (
              <article
                key={cl.id}
                className="client-card spot"
                data-client={cl.id}
                data-reveal
                aria-labelledby={`client-${cl.id}`}
              >
                <TraceBox i={i % 2} />
                <div className="client-card__media">{media(cl)}</div>
                <div className="client-card__text">
                  <div>
                    <h3 id={`client-${cl.id}`} className="client-card__name">
                      {cl.name}
                    </h3>
                    {cl.domain && <p className="t-data ink-3">{cl.domain}</p>}
                  </div>
                  <p className="meta t-small">
                    <StatusBadge status={cl.status} label={s(cl.status)} />
                    {t.has(`${k}.country`) && <span>{t(`${k}.country`)}</span>}
                    <span className="t-data">{cl.year}</span>
                  </p>

                  {hasReview && (
                    <figure className="review review--pull">
                      <blockquote>
                        <p className="review__pull">«{t(`${k}.review.pull`)}»</p>
                        <p className="review__full">«{t(`${k}.review.quote`)}»</p>
                      </blockquote>
                      <figcaption className="t-small">
                        <span className="ink-2">
                          {t(`${k}.review.author`)} · {t(`${k}.review.org`)} ·{" "}
                          <span className="t-data">{t(`${k}.review.rating`)}</span>
                        </span>
                        <span>{t(`${k}.review.project`)}</span>
                        {t.has(`${k}.review.translated`) && <span>{t(`${k}.review.translated`)}</span>}
                      </figcaption>
                    </figure>
                  )}

                  <p className="card__summary">{t(`${k}.summary`)}</p>

                  {t.has(`${k}.infraValue`) ? (
                    <div className="facts-wrap">
                      <dl className="facts">
                        <div className="facts__row">
                          <dt>{t("published")}</dt>
                          <dd className="t-data">{t(`${k}.publishedValue`)}</dd>
                        </div>
                        <div className="facts__row">
                          <dt>{t("lighthouse")}</dt>
                          <dd className="t-data">{t(`${k}.lighthouseValue`)}</dd>
                        </div>
                        <div className="facts__row">
                          <dt>{t("infra")}</dt>
                          <dd className="t-data">{t(`${k}.infraValue`)}</dd>
                        </div>
                      </dl>
                    </div>
                  ) : (
                    t.has(`${k}.stackValue`) && <p className="tech t-data">{t(`${k}.stackValue`)}</p>
                  )}

                  <div className="card__actions">
                    {cl.url && (
                      <TextLink href={cl.url} external newTabLabel={m.newTab}>
                        {t("visit")}
                      </TextLink>
                    )}
                    {cl.demoUrl && (
                      <TextLink href={cl.demoUrl} external newTabLabel={m.newTab}>
                        {t("demoWon")}
                      </TextLink>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
