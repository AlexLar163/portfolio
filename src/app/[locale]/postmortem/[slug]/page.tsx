import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { POSTMORTEM_SLUG } from "@/data/cases";
import { pageMeta } from "@/lib/page-meta";
import { PostmortemPage } from "@/components/cases/PostmortemPage";

type Params = { params: Promise<{ locale: string; slug: string }> };

/**
 * Páginas estáticas para los slugs del contenido. Un slug desconocido se
 * resuelve con notFound() explícito (404 del idioma): con dynamicParams=false
 * Next dejaba «NoFallbackError» en el log de cada petición (QA).
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale, slug: POSTMORTEM_SLUG }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  if (slug !== POSTMORTEM_SLUG) return {};
  const t = await getTranslations({ locale, namespace: "postmortem" });
  return pageMeta({
    locale,
    path: `/postmortem/${slug}`,
    title: `${t("slugTitle")} · Alex Largo`,
    description: t("metaDescription"),
  });
}

export default async function Page({ params }: Params) {
  const { locale, slug } = await params;
  if (slug !== POSTMORTEM_SLUG) notFound();
  setRequestLocale(locale);
  return <PostmortemPage locale={locale} />;
}
