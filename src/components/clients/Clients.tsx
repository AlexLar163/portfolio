import { getTranslations } from "next-intl/server";
import { clients } from "@/data/clients";
import type { Client } from "@/data/types";
import { SIZES, SLOT } from "@/lib/media";
import { Section } from "@/components/ui/Section";
import { StatusBadge, TextLink } from "@/components/ui/primitives";
import { MediaFrame } from "@/components/media/MediaFrame";
import { GalleryFrame } from "@/components/media/GalleryFrame";
import { gallerySlides, slideFrom } from "@/components/media/build";
import { mediaText } from "@/components/media/text";

export async function Clients() {
  const t = await getTranslations("clients");
  const s = await getTranslations("status");
  const c = await getTranslations("common");
  const m = await mediaText();
  const lead = clients.find((x) => x.lead)!;
  const rest = clients.filter((x) => !x.lead);

  const meta = (cl: Client) => (
    <p className="meta t-small">
      <StatusBadge status={cl.status} label={s(cl.status)} />
      {t.has(`items.${cl.id}.country`) && <span>{t(`items.${cl.id}.country`)}</span>}
      <span className="t-data">{cl.year}</span>
    </p>
  );

  return (
    <Section id="clientes" title={t("title")} lead={t("lead")}>
      {/* Caso principal: 3Destiny */}
      <article className="grid case" aria-labelledby="case-3destiny">
        <div className="case__media">
          <GalleryFrame
            slides={gallerySlides(lead.id, lead.media, SLOT.feature, lead.name, m.alt)}
            name={lead.name}
            address={lead.domain ?? m.captures}
            status={{ status: lead.status, label: s(lead.status) }}
            sizes={SIZES.feature}
            placeholder={lead.name}
            labels={m.labels}
            thumbLabel={c.raw("view").replace("{name}", lead.name)}
            galleryLabel={c("gallery", { name: lead.name })}
          />
        </div>
        <div className="case__text">
          <div>
            <h3 id="case-3destiny" className="t-h3">
              {lead.name}
            </h3>
            <p className="t-data ink-3">{lead.domain}</p>
          </div>
          {meta(lead)}
          <p className="card__summary t-body">{t(`items.${lead.id}.summary`)}</p>
          <div className="facts-wrap">
            <dl className="facts">
              <div className="facts__row">
                <dt>{t("published")}</dt>
                <dd className="t-data">{t(`items.${lead.id}.publishedValue`)}</dd>
              </div>
              <div className="facts__row">
                <dt>{t("lighthouse")}</dt>
                <dd className="t-data">{t(`items.${lead.id}.lighthouseValue`)}</dd>
              </div>
              <div className="facts__row">
                <dt>{t("infra")}</dt>
                <dd className="t-data">{t(`items.${lead.id}.infraValue`)}</dd>
              </div>
            </dl>
          </div>
          {lead.url && (
            <p>
              <TextLink href={lead.url} external newTabLabel={m.newTab}>
                {t("visit")}
              </TextLink>
            </p>
          )}
        </div>
      </article>

      {/* Los otros tres, compactos */}
      <div className="grid client-cards">
        {rest.map((cl) => (
          <article key={cl.id} className="card card--row-md" aria-labelledby={`client-${cl.id}`}>
            <div className="card__media">
              <MediaFrame
                slides={[slideFrom(cl.id, cl.media, SLOT.third, cl.name, m.alt)]}
                name={cl.name}
                address={cl.domain ?? m.captures}
                sizes={SIZES.third}
                placeholder={cl.name}
                labels={m.labels}
              />
            </div>
            <div className="card__body">
              <h3 id={`client-${cl.id}`} className="t-h3">
                {cl.name}
              </h3>
              {meta(cl)}
              <p className="card__summary">{t(`items.${cl.id}.summary`)}</p>
              <p className="tech t-data">{t(`items.${cl.id}.stackValue`)}</p>
              {cl.review && t.has(`items.${cl.id}.review.quote`) && (
                <figure className="review">
                  <blockquote>
                    <p>«{t(`items.${cl.id}.review.quote`)}»</p>
                  </blockquote>
                  <figcaption className="t-small">
                    <span className="ink-2">
                      {t(`items.${cl.id}.review.author`)} · {t(`items.${cl.id}.review.org`)} ·{" "}
                      <span className="t-data">{t(`items.${cl.id}.review.rating`)}</span>
                    </span>
                    <span>{t(`items.${cl.id}.review.project`)}</span>
                    {t.has(`items.${cl.id}.review.translated`) && (
                      <span>{t(`items.${cl.id}.review.translated`)}</span>
                    )}
                  </figcaption>
                </figure>
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
        ))}
      </div>
    </Section>
  );
}
