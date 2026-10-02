import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { CASE_SLUGS, POSTMORTEM_SLUG } from "@/data/cases";
import { SITE_URL } from "@/lib/site";

/** Home + casos + postmortem, cada página con su par ES/EN. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = [
    { path: "", priority: 1, changeFrequency: "monthly" as const },
    ...CASE_SLUGS.map((slug) => ({ path: `/casos/${slug}`, priority: 0.7, changeFrequency: "yearly" as const })),
    { path: `/postmortem/${POSTMORTEM_SLUG}`, priority: 0.6, changeFrequency: "yearly" as const },
  ];
  return pages.flatMap((p) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${p.path}`,
      lastModified: now,
      changeFrequency: p.changeFrequency,
      // El idioma por defecto conserva la prioridad; el otro, un escalón menos (como la home).
      priority: locale === routing.defaultLocale ? p.priority : +(p.priority * 0.8).toFixed(2),
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}${p.path}`])),
      },
    })),
  );
}
