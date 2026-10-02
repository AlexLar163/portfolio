import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { POSTMORTEM_SLUG } from "@/data/cases";
import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Alex Largo — postmortem";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (slug !== POSTMORTEM_SLUG) notFound();
  const t = await getTranslations({ locale, namespace: "postmortem" });
  return renderOg({
    // Sin la fecha entre paréntesis en el título: en 68 px se partía en «(8-» / «Sep-2026)» (QA).
    eyebrow: t("ogEyebrow"),
    title: t("ogTitle"),
    sub: "Alex Largo · Fullstack & DevOps Engineer",
    nodes: t.raw("og") as string[],
  });
}
