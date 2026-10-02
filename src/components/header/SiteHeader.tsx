import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { profile } from "@/data/profile";
import { HeaderBar } from "./HeaderBar";

export const NAV_SECTIONS = ["devops", "clientes", "proyectos", "experiencia", "contacto"] as const;

/** `sub`: subpágina (casos, postmortem) — la navegación apunta a las secciones de la home. */
export async function SiteHeader({ sub = false }: { sub?: boolean } = {}) {
  const t = await getTranslations("nav");
  const p = await getTranslations("profile");
  const locale = (await getLocale()) as Locale;
  return (
    <HeaderBar
      name={profile.name}
      base={sub ? `/${locale}` : undefined}
      sections={NAV_SECTIONS.map((id) => ({ id, label: t(id) }))}
      cv={{ href: profile.cv[locale], label: t("cv") }}
      availability={{ short: t("available"), full: p("availability") }}
      labels={{
        home: t("home"),
        primary: t("primary"),
        menuOpen: t("menuOpen"),
        menuClose: t("menuClose"),
        lang: t("lang"),
      }}
    />
  );
}
