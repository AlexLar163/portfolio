import { getTranslations } from "next-intl/server";
import { ArrowUp } from "lucide-react";
import { LocaleSwitch } from "@/components/header/LocaleSwitch";
import { social } from "@/data/profile";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const c = await getTranslations("common");
  const links = [social("github"), social("linkedin")];
  // Detalle de ingeniero, y verdadero: el commit del build de Vercel (si existe).
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="site-footer__inner t-small">
          <p>{t("rights")}</p>
          <p>
            {t("built")}
            {commit && (
              <>
                {" · "}
                {t("build")} <span className="t-data">{commit}</span>
              </>
            )}
          </p>
          <ul className="site-footer__links" aria-label={t("links")}>
            {links.map((l) => (
              <li key={l.id}>
                <a className="link" href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                  <span className="sr-only"> {c("newTab")}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="site-footer__end">
            <LocaleSwitch label={nav("lang")} />
            <a className="link" href="#inicio">
              {t("top")}
              <ArrowUp className="link__icon" strokeWidth={1.5} aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
