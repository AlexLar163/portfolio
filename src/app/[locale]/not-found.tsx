import { getLocale, getTranslations } from "next-intl/server";
import { profile } from "@/data/profile";
import { ButtonLink } from "@/components/ui/primitives";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations("notFound");
  return (
    <>
      <header className="site-header">
        <div className="shell">
          <div className="site-header__bar">
            <a href={`/${locale}`} className="brand">
              {profile.name}
            </a>
          </div>
        </div>
      </header>
      <main id="contenido" className="section">
        <div className="shell">
          <div className="not-found">
            <p className="t-data ink-3">{t("code")}</p>
            <h1 className="t-h2">{t("title")}</h1>
            <p className="t-lead">{t("text")}</p>
            <p>
              <ButtonLink href={`/${locale}`} size="lg">
                {t("home")}
              </ButtonLink>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
