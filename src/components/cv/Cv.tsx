import { getLocale, getTranslations } from "next-intl/server";
import { Download } from "lucide-react";
import { profile } from "@/data/profile";
import { fileBytes } from "@/lib/media";
import { formatBytes, formatMonth } from "@/lib/format";

/** Banda corta de CV. El peso se calcula en build; si el PDF aún no está, no se muestra. */
export async function Cv() {
  const t = await getTranslations("cv");
  const locale = await getLocale();
  const langs = ["es", "en"] as const;

  return (
    <section id="cv" aria-labelledby="cv-title" className="section">
      <div className="shell">
        <div className="grid cv-band">
          <div>
            <h2 id="cv-title" className="t-h2">
              {t("title")}
            </h2>
            <p>{t("text", { date: formatMonth(profile.cvUpdated, locale, "long") })}</p>
          </div>
          <div className="cv-actions">
            {langs.map((lang) => {
              const href = profile.cv[lang];
              const bytes = fileBytes(href);
              return (
                <a
                  key={lang}
                  href={href}
                  hrefLang={lang}
                  lang={lang}
                  download
                  className="btn btn--secondary btn--lg cv-dl"
                >
                  <Download size={20} strokeWidth={1.5} aria-hidden />
                  <span>
                    {t(lang)} · PDF
                    {bytes !== null && <span className="t-data"> · {formatBytes(bytes, locale)}</span>}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
