import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/header/SiteHeader";
import { Hero } from "@/components/hero/Hero";
import { Clients } from "@/components/clients/Clients";
import { DevOps } from "@/components/devops/DevOps";
import { Projects } from "@/components/projects/Projects";
import { Experience } from "@/components/experience/Experience";
import { Stack } from "@/components/stack/Stack";
import { Cv } from "@/components/cv/Cv";
import { Contact } from "@/components/contact/Contact";
import { SiteFooter } from "@/components/SiteFooter";

// Orden fijo (DISENO §3): Header → Hero → Clientes → DevOps → Productos → Experiencia → Stack → CV → Contacto → Footer.
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");

  return (
    <>
      <a className="skip-link" href="#contenido">
        {t("skip")}
      </a>
      <SiteHeader />
      <main id="contenido">
        <Hero />
        <Clients />
        <DevOps />
        <Projects />
        <Experience />
        <Stack />
        <Cv />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
