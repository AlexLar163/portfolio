import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { caseBySlug, CASE_SLUGS } from "@/data/cases";
import { pageMeta } from "@/lib/page-meta";
import { CasePage } from "@/components/cases/CasePage";

type Params = { params: Promise<{ locale: string; slug: string }> };

/**
 * Páginas estáticas para los slugs del contenido. Un slug desconocido se
 * resuelve con notFound() explícito (404 del idioma): con dynamicParams=false
 * Next dejaba «NoFallbackError» en el log de cada petición (QA).
 */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => CASE_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!caseBySlug(slug)) return {};
  const t = await getTranslations({ locale, namespace: "cases.items" });
  return pageMeta({
    locale,
    path: `/casos/${slug}`,
    title: `${t(`${slug}.title`)} · Alex Largo`,
    description: t(`${slug}.summary`),
  });
}

export default async function Page({ params }: Params) {
  const { locale, slug } = await params;
  const def = caseBySlug(slug);
  if (!def) notFound();
  setRequestLocale(locale);
  return <CasePage def={def} locale={locale} />;
}
