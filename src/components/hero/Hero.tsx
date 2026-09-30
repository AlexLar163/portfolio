import { getLocale, getTranslations } from "next-intl/server";
import { Download } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { profile } from "@/data/profile";
import { resolveImage, resolveVideo } from "@/lib/media";
import { ButtonLink } from "@/components/ui/primitives";
import { ChapterRow } from "./ChapterRow";

/** Las tres prioridades en el primer viewport (DISENO-v2 §4.1). */
const CHAPTERS = [
  { id: "devops", href: "#devops", image: { slug: "appsmonitor", key: "proyectos" }, position: "top" },
  {
    id: "clients",
    href: "#clientes",
    image: { slug: "3destiny", key: "portada" },
    video: { slug: "3destiny", key: "recorrido" },
  },
  {
    id: "products",
    href: "#proyectos",
    image: { slug: "turnia", key: "landing-portada" },
    video: { slug: "turnia", key: "recorrido" },
  },
] as const;

export async function Hero() {
  const locale = (await getLocale()) as Locale;
  const other: Locale = locale === "es" ? "en" : "es";
  const t = await getTranslations("hero");
  const p = await getTranslations("profile");

  return (
    <section id="inicio" aria-labelledby="inicio-title" className="hero">
      <div className="shell">
        <div className="grid hero__grid">
          <div className="hero__main">
            <h1 id="inicio-title">
              <span className="t-display hero__name">{profile.name}</span>
              <span className="t-role">{p("role")}</span>
            </h1>
            <p className="t-lead hero__lead">{p("lead")}</p>
            <div className="hero__actions">
              <ButtonLink href="#contacto" size="lg" className="magnetic">
                {t("contact")}
              </ButtonLink>
              <ButtonLink
                href={profile.cv[locale]}
                variant="secondary"
                size="lg"
                download
                hrefLang={locale}
                className="magnetic"
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

          <nav className="hero__index" aria-label={t("indexLabel")}>
            <ul>
              {CHAPTERS.map((c) => {
                const img = resolveImage(c.image);
                const vid = "video" in c ? resolveVideo(c.video) : undefined;
                return (
                  <li key={c.id}>
                    <ChapterRow
                      href={c.href}
                      title={t(`chapters.${c.id}.title`)}
                      sub={t(`chapters.${c.id}.sub`)}
                      image={img && { src: img.src, position: "position" in c ? c.position : undefined }}
                      video={vid && { mp4: vid.mp4, webm: vid.webm }}
                    />
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
