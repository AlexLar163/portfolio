import { getTranslations } from "next-intl/server";
import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Alex Largo — postmortem";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "postmortem" });
  return renderOg({
    eyebrow: t("eyebrow"),
    title: t("title"),
    sub: "Alex Largo · Fullstack & DevOps Engineer",
    nodes: t.raw("og") as string[],
  });
}
