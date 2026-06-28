import type { Profile } from "./types";

/**
 * Single source of truth for personal data.
 * Edit here — every section reads from this object.
 */
export const profile: Profile = {
  name: "Alex Largo",
  role: {
    es: "Fullstack Developer",
    en: "Fullstack Developer",
  },
  tagline: {
    es: "Construyo web & cloud de extremo a extremo.",
    en: "I build web & cloud end to end.",
  },
  summary: {
    es: "Construyo aplicaciones web y soluciones cloud de extremo a extremo: del frontend a la API, la base de datos y el despliegue automatizado. Player desde 2021. Ahora en NTT Data.",
    en: "I build web apps and cloud solutions end to end: from the frontend to the API, the database and automated deployment. Player since 2021. Currently at NTT Data.",
  },
  email: "alexlar163@gmail.com",
  // Drop a PDF in /public and set this to "/cv-alex-largo.pdf" to show the CV button.
  cvUrl: undefined,
  core: ["React", "NestJS", "AWS", "Next.js", "TypeScript", "Docker"],
  socials: [
    {
      id: "email",
      label: "Email",
      handle: "alexlar163@gmail.com",
      href: "mailto:alexlar163@gmail.com",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      handle: "alex-largo →",
      href: "https://www.linkedin.com/in/alex-largo-05324a1a2/",
    },
    {
      id: "github",
      label: "GitHub",
      handle: "AlexLar163 →",
      href: "https://github.com/AlexLar163",
    },
  ],
  stats: [
    { id: "repos", label: { es: "Repos", en: "Repos" }, value: "30+" },
    {
      id: "years",
      label: { es: "Años XP", en: "Years XP" },
      value: "5+",
    },
    {
      id: "tech",
      label: { es: "Tecnologías", en: "Technologies" },
      value: "40+",
    },
  ],
};
