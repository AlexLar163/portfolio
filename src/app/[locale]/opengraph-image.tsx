import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Alex Largo — Fullstack & DevOps Engineer";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return renderOg({
    title: "Alex Largo",
    sub: "Fullstack & DevOps Engineer",
    nodes: [locale === "en" ? "Visitors" : "Visitantes", "DNS", "Caddy", "WordPress · n8n"],
    accent: "Caddy",
  });
}
