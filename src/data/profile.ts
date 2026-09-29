import type { Locale } from "@/i18n/routing";
import type { Social } from "./types";

/**
 * Datos personales. Los textos (rol, lead, disponibilidad, «ahora») están en
 * `messages/*.json` → namespace `profile`. La disponibilidad del hero se cambia
 * en UN solo sitio: `profile.availability` de cada idioma.
 */
export const profile = {
  name: "Alex Largo",
  email: "alexlar163@gmail.com",
  timezone: "UTC−5",
  /** Mes de la última actualización de los PDF del CV (se formatea con Intl). */
  cvUpdated: "2026-09",
  cv: {
    es: "/cv/alex-largo-cv-es.pdf",
    en: "/cv/alex-largo-cv-en.pdf",
  } satisfies Record<Locale, string>,
  socials: [
    {
      id: "github",
      label: "GitHub",
      handle: "AlexLar163",
      href: "https://github.com/AlexLar163",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      handle: "alex-largo",
      href: "https://www.linkedin.com/in/alex-largo-05324a1a2/",
    },
    {
      id: "email",
      label: "Email",
      handle: "alexlar163@gmail.com",
      href: "mailto:alexlar163@gmail.com",
    },
  ] satisfies Social[],
};

export function social(id: Social["id"]): Social {
  const s = profile.socials.find((x) => x.id === id);
  if (!s) throw new Error(`social ${id} no existe`);
  return s;
}
