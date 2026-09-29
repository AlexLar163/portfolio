import { getTranslations } from "next-intl/server";
import { ArrowUp } from "lucide-react";
import { LocaleSwitch } from "@/components/header/LocaleSwitch";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
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
