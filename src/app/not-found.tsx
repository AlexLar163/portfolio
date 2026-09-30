import { ButtonLink } from "@/components/ui/primitives";
import { routing } from "@/i18n/routing";
import es from "../../messages/es.json";
import { fontClasses } from "./fonts";
import "./globals.css";

/** 404 fuera de /es y /en (p. ej. /cv/nada.pdf). Va en el idioma por defecto. */
export default function RootNotFound() {
  const t = es.notFound;
  const home = `/${routing.defaultLocale}`;
  return (
    <html lang={routing.defaultLocale} className={fontClasses}>
      <body>
        <title>{`${t.title} — Alex Largo`}</title>
        <header className="site-header">
          <div className="shell">
            <div className="site-header__bar">
              <a href={home} className="brand">
                Alex Largo
              </a>
            </div>
          </div>
        </header>
        <main id="contenido" className="section">
          <div className="shell">
            <div className="not-found">
              <p className="t-data ink-3">{t.code}</p>
              <h1 className="t-h2">{t.title}</h1>
              <p className="t-lead">{t.text}</p>
              <p>
                <ButtonLink href={home} size="lg">
                  {t.home}
                </ButtonLink>
              </p>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
