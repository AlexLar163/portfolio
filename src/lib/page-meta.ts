import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

/**
 * Metadatos de una subpágina: canonical propio, alternates ES/EN con
 * x-default, y Open Graph de tipo artículo. La imagen OG la pone el
 * `opengraph-image.tsx` de cada ruta (convención de archivo de Next).
 */
export function pageMeta({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  /** Ruta sin el idioma, p. ej. `/casos/turnia`. */
  path: string;
  title: string;
  description: string;
}): Metadata {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `/${l}${path}`]));
  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `/${locale}${path}`,
      languages: { ...languages, "x-default": `/${routing.defaultLocale}${path}` },
    },
    openGraph: {
      title,
      description,
      url: `/${locale}${path}`,
      siteName: "Alex Largo",
      locale: locale === "es" ? "es_ES" : "en_US",
      type: "article",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
