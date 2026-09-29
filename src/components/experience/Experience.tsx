import { getLocale, getTranslations } from "next-intl/server";
import { education, experience } from "@/data/experience";
import { formatMonth, formatPeriod } from "@/lib/format";
import { Section } from "@/components/ui/Section";
import { TechList } from "@/components/ui/primitives";

export async function Experience() {
  const t = await getTranslations("experience");
  const locale = await getLocale();

  return (
    <Section id="experiencia" title={t("title")}>
      <ol className="xp">
        {experience.map((e, i) => {
          const next = experience[i + 1];
          const parallel = e.parallelWith
            ? next?.id === e.parallelWith
              ? "first"
              : "last"
            : undefined;
          return (
            <li key={e.id} className="grid xp__row" data-parallel={parallel}>
              <p className="xp__period t-data">
                {formatPeriod(e.start, e.end, locale, t("present"))}
                {parallel === "first" && <span className="xp__parallel">{t("parallel")}</span>}
              </p>
              <h3 className="xp__role t-h3">
                {t(`items.${e.id}.role`)}
                <span className="xp__company t-small">{e.company}</span>
              </h3>
              <div className="xp__desc">
                <p className="t-body">{t(`items.${e.id}.summary`)}</p>
                {e.tech && (
                  <p className="tech">
                    <TechList items={e.tech} max={6} />
                  </p>
                )}
              </div>
            </li>
          );
        })}
        <li className="grid xp__row xp__row--edu t-small">
          <p className="xp__period t-data">{formatMonth(education.year, locale)}</p>
          <p className="xp__role">
            <span className="ink-3">{t("education.label")}</span>
            <span className="xp__company">{t("education.degree")}</span>
          </p>
          <p className="xp__desc ink-2">{t("education.school")}</p>
        </li>
      </ol>
    </Section>
  );
}
