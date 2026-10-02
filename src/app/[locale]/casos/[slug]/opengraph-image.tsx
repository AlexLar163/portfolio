import { getTranslations } from "next-intl/server";
import { caseBySlug } from "@/data/cases";
import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Alex Largo — caso de estudio";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "cases" });
  const def = caseBySlug(slug);
  return renderOg({
    eyebrow: `${t("ui.cases")} · ${def ? t(`ui.kind.${def.kind}`) : ""}`,
    title: t(`items.${slug}.title`),
    sub: "Alex Largo · Fullstack & DevOps Engineer",
    nodes: t.raw(`items.${slug}.og`) as string[],
  });
}
