import { getTranslations } from "next-intl/server";
import { Mail } from "lucide-react";
import { profile, social } from "@/data/profile";
import { GithubIcon, LinkedinIcon, TextLink } from "@/components/ui/primitives";
import { ContactForm } from "./ContactForm";
import { CopyEmail } from "./CopyEmail";

export async function Contact() {
  const t = await getTranslations("contact");
  const c = await getTranslations("common");
  const gh = social("github");
  const li = social("linkedin");
  const keys = [
    "name", "email", "message", "send", "sending", "success", "errorSend", "errName",
    "errEmail", "errMessage", "namePlaceholder", "emailPlaceholder", "messagePlaceholder",
    "copy", "copied",
  ] as const;
  const texts = Object.fromEntries(keys.map((k) => [k, t(k)])) as Record<(typeof keys)[number], string>;

  return (
    <section id="contacto" aria-labelledby="contacto-title" className="section">
      <div className="shell">
        <div className="grid contact">
          <div className="contact__intro">
            <h2 id="contacto-title" className="t-h2">
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
          </div>
          <div className="contact__form">
            <ContactForm t={texts} email={profile.email} />
          </div>
        </div>
      </div>
    </section>
  );
}
