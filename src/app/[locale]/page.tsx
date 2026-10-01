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

// Orden v2 (DISENO-v2 §3, se mantiene en v3): Header → Hero → DevOps → Clientes → Destacados →
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
      {/* Spotlight de cursor sobre la retícula (v3 «Circuito»): capa fija, solo transform. */}
      <div className="spotlight" aria-hidden="true" data-overflow-ok>
        <i />
      </div>
      <SiteHeader />
      <main id="contenido">
        {/* Pista del circuito: la dibuja src/motion/circuit.ts detrás del contenido. */}
        <div className="circuit" aria-hidden="true" data-overflow-ok>
          <svg focusable="false" />
          <span className="circuit__pk" />
        </div>
        <Hero />
        <DevOps />
        <Clients />
        <Featured />
        <MoreProjects />
        <Trajectory />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
