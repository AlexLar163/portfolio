import { getLocale, getTranslations } from "next-intl/server";
import { Download, Mail } from "lucide-react";
import { profile, social } from "@/data/profile";
import { fileBytes } from "@/lib/media";
import { formatBytes, formatMonth } from "@/lib/format";
import { GithubIcon, LinkedinIcon, TextLink } from "@/components/ui/primitives";
import { ContactForm } from "./ContactForm";
import { CopyEmail } from "./CopyEmail";

export async function Contact() {
  const t = await getTranslations("contact");
  const c = await getTranslations("common");
  const cv = await getTranslations("cv");
  const locale = await getLocale();
  const gh = social("github");
  const li = social("linkedin");
  const keys = [
    "name", "email", "message", "send", "sending", "success", "errorSend", "errName",
    "errEmail", "errMessage", "namePlaceholder", "emailPlaceholder", "messagePlaceholder",
    "copy", "copied", "errRate",
  ] as const;
  const texts = {
    ...(Object.fromEntries(keys.map((k) => [k, t(k)])) as Record<(typeof keys)[number], string>),
    // Plantilla con {max}: la completa el formulario según el campo.
    errTooLong: t.raw("errTooLong") as string,
    wireFrom: t("wire.from"),
    wireTo: t("wire.to"),
  };

  return (
    <section id="contacto" aria-labelledby="contacto-title" className="section">
      <div className="shell">
        <div className="grid contact">
          <div className="contact__intro">
            <h2 id="contacto-title" className="t-chapter rail-title" data-rail>
              {t("title")}
            </h2>
            <p className="t-lead contact__lead">
              {t("lead")}
            </p>
            <h3 className="sr-only">{t("channels")}</h3>
            <ul className="channels">
              <li>
                <Mail size={16} strokeWidth={1.5} aria-hidden />
                <a className="link t-data" href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>
                <CopyEmail email={profile.email} copy={t("copy")} copied={t("copied")} />
              </li>
              <li>
                <LinkedinIcon />
                <TextLink href={li.href} external newTabLabel={c("newTab")}>
                  {li.label}
                </TextLink>
              </li>
              <li>
                <GithubIcon />
                <TextLink href={gh.href} external newTabLabel={c("newTab")}>
                  {gh.label}
                </TextLink>
              </li>
            </ul>
            <dl className="contact__facts">
              <div>
                <dt>{t("base")}</dt>
                <dd>{t("baseValue")}</dd>
              </div>
              <div>
                <dt>{t("languages")}</dt>
                <dd>{t("languagesValue")}</dd>
              </div>
            </dl>
            {/* #cv: el ancla de v1 aterriza en las descargas. */}
            <div id="cv" className="contact__cv" role="group" aria-labelledby="cv-title">
              <h3 id="cv-title" className="t-small ink-3">
                {t("cvTitle")} · {cv("text", { date: formatMonth(profile.cvUpdated, locale, "long") })}
              </h3>
              <div className="cv-actions">
                {(["es", "en"] as const).map((lang) => {
                  const href = profile.cv[lang];
                  const bytes = fileBytes(href);
                  return (
                    <a
                      key={lang}
                      href={href}
                      hrefLang={lang}
                      lang={lang}
                      download
                      className="btn btn--secondary cv-dl magnetic"
                    >
                      <Download size={18} strokeWidth={1.5} aria-hidden />
                      <span>
                        {cv(lang)} · PDF
                        {bytes !== null && <span className="t-data"> · {formatBytes(bytes, locale)}</span>}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="contact__form">
            <ContactForm t={texts} email={profile.email} />
          </div>
        </div>
      </div>
    </section>
  );
}
