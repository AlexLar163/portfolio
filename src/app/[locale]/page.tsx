import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/header/SiteHeader";
import { Hero } from "@/components/hero/Hero";
import { DevOps } from "@/components/devops/DevOps";
import { Clients } from "@/components/clients/Clients";
import { Featured } from "@/components/projects/Featured";
import { MoreProjects } from "@/components/projects/MoreProjects";
import { Trajectory } from "@/components/experience/Trajectory";
import { Contact } from "@/components/contact/Contact";
import { SiteFooter } from "@/components/SiteFooter";
import { MotionRoot } from "@/motion/MotionRoot";
import { MotionScene } from "@/motion/MotionScene";

// Orden v2 (DISENO-v2 §3): Header → Hero → DevOps → Clientes → Destacados →
// Más demos + Otros → Trayectoria → Contacto (+CV) → Footer.
// Si Alex prefiere Clientes antes que DevOps, se invierten esas dos líneas.
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  return (
    <>
      <a className="skip-link" href="#contenido">
        {t("skip")}
      </a>
      <MotionRoot />
      <SiteHeader />
      <main id="contenido">
        <Hero />
        <DevOps />
        <Clients />
        <Featured />
        <MoreProjects />
        <Trajectory />
        <Contact />
      </main>
      <SiteFooter />
      <MotionScene name="chrome" />
    </>
  );
}
