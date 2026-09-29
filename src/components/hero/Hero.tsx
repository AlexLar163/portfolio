import { getLocale, getTranslations } from "next-intl/server";
import { Download } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { profile, social } from "@/data/profile";
import { ButtonLink, TextLink } from "@/components/ui/primitives";

export async function Hero() {
  const locale = (await getLocale()) as Locale;
  const other: Locale = locale === "es" ? "en" : "es";
  const t = await getTranslations("hero");
  const p = await getTranslations("profile");
  const c = await getTranslations("common");
  const gh = social("github");
  const li = social("linkedin");

  return (
    <section id="inicio" aria-labelledby="inicio-title">
      <div className="shell">
        <div className="grid hero__grid">
          <div className="hero__main">
            <h1 id="inicio-title">
              <span className="t-display">{profile.name}</span>
              <span className="t-role">{p("role")}</span>
            </h1>
            <p className="t-lead hero__lead">{p("lead")}</p>
            <div className="hero__actions">
              <ButtonLink href="#contacto" size="lg">
                {t("contact")}
              </ButtonLink>
              <ButtonLink
                href={profile.cv[locale]}
                variant="secondary"
                size="lg"
                download
                hrefLang={locale}
                icon={<Download size={20} strokeWidth={1.5} aria-hidden />}
              >
                {t("downloadCv")}
              </ButtonLink>
            </div>
            <p className="t-small hero__alt">
              <a className="link" href={profile.cv[other]} hrefLang={other} lang={other} download>
                {t("otherCv")}
              </a>
            </p>
          </div>

          <div className="hero__sheet sheet-wrap">
            <div className="sheet" role="group" aria-label={p("sheetLabel")}>
              <div className="sheet__head">
                <span className="monogram" role="img" aria-label={p("monogram")}>
                  AL
                </span>
                <p className="availability">{p("availability")}</p>
              </div>
              <dl>
                <div className="sheet__row">
                  <dt>{p("now")}</dt>
                  <dd>{p("nowMain")}</dd>
                  <dd className="t-small ink-2">{p("nowParallel")}</dd>
                </div>
                <div className="sheet__row">
                  <dt>{p("base")}</dt>
                  <dd>
                    {p("baseValue")} · <span className="t-data">{profile.timezone}</span>
                  </dd>
                </div>
                <div className="sheet__row">
                  <dt>{p("languages")}</dt>
                  <dd>{p("languagesValue")}</dd>
                </div>
                <div className="sheet__row">
                  <dt>{p("links")}</dt>
                  <dd className="sheet__links">
                    <TextLink href={gh.href} external newTabLabel={c("newTab")}>
                      {gh.label}
                    </TextLink>
                    <TextLink href={li.href} external newTabLabel={c("newTab")}>
                      {li.label}
                    </TextLink>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
