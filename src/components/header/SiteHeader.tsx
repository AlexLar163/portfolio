import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { profile } from "@/data/profile";
import { HeaderBar } from "./HeaderBar";

export const NAV_SECTIONS = ["clientes", "devops", "proyectos", "experiencia", "contacto"] as const;

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const locale = (await getLocale()) as Locale;
  return (
    <HeaderBar
      name={profile.name}
      sections={NAV_SECTIONS.map((id) => ({ id, label: t(id) }))}
      cv={{ href: profile.cv[locale], label: t("cv") }}
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
