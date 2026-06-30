import type { Project } from "./types";

/**
 * Projects = "Quests". Add as many as you want; the grid adapts.
 * Replace `links.demo` / `links.repo` with your real URLs.
 */
export const projects: Project[] = [
  {
    id: "finansfit",
    title: { es: "FinansFit", en: "FinansFit" },
    category: "personal",
    kind: { es: "Proyecto personal", en: "Personal project" },
    year: "2026",
    featured: true,
    problem: {
      es: "Llevar las finanzas personales desde el móvil, sin depender de internet.",
      en: "Manage personal finances from your phone, with no internet dependency.",
    },
    solution: {
      es: "App móvil multiplataforma (Expo / React Native) local-first con SQLite y Drizzle, recordatorios e importación/exportación de datos.",
      en: "Cross-platform mobile app (Expo / React Native), local-first with SQLite + Drizzle, reminders and data import/export.",
    },
    result: {
      es: "Seguimiento de gastos offline con notificaciones, multi-idioma (i18n) y exportación de informes.",
      en: "Offline expense tracking with notifications, multi-language (i18n) and report export.",
    },
    tech: [
      "Expo",
      "React Native",
      "TypeScript",
      "Drizzle ORM",
      "SQLite",
      "NativeWind",
      "i18next",
    ],
    links: { repo: "https://github.com/AlexLar163/FinansFit" },
  },
  {
    id: "portfolio",
    title: { es: "Portfolio 8-bit", en: "8-bit Portfolio" },
    category: "personal",
    kind: { es: "Proyecto personal", en: "Personal project" },
    year: "2026",
    problem: {
      es: "Un portfolio que destaque y muestre todo lo que sé hacer, no uno genérico.",
      en: "A portfolio that stands out and shows everything I can do, not a generic one.",
    },
    solution: {
      es: "Web interactiva con estética 8-bit en Next.js 16: bilingüe (i18n), formulario de contacto con Server Actions + Resend, mini-juego y todo data-driven.",
      en: "Interactive 8-bit themed site in Next.js 16: bilingual (i18n), contact form with Server Actions + Resend, a mini-game and fully data-driven.",
    },
    result: {
      es: "Desplegada en Vercel, responsive, en ES/EN y editable desde datos tipados.",
      en: "Deployed on Vercel, responsive, in ES/EN and editable from typed data.",
    },
    tech: [
      "Next.js",
      "TypeScript",
      "Tailwind",
      "next-intl",
      "Resend",
      "Vercel",
    ],
    links: {
      demo: "https://porfolio-sigma-eight-23.vercel.app",
      repo: "https://github.com/AlexLar163/portfolio",
    },
  },
  {
    id: "trompo",
    title: { es: "Trompo Mobiliario Infantil", en: "Trompo Mobiliario Infantil" },
    category: "work",
    kind: { es: "Side Quest", en: "Side Quest" },
    year: "2022",
    problem: {
      es: "Marca sin presencia web ni catálogo digital.",
      en: "A brand with no web presence or digital catalogue.",
    },
    solution: {
      es: "Web + API segura con autenticación y despliegue en la nube.",
      en: "Website + secure API with authentication and cloud deployment.",
    },
    result: {
      es: "Catálogo online y endpoints protegidos en producción.",
      en: "Online catalogue and protected endpoints in production.",
    },
    tech: ["Next.js", "Tailwind", "NestJS", "PostgreSQL", "Vercel", "Render"],
    links: { demo: "#", repo: "https://github.com/AlexLar163" },
  },
  {
    id: "evaluar",
    title: { es: "Plataforma Evaluar", en: "Evaluar Platform" },
    category: "work",
    kind: { es: "Raid", en: "Raid" },
    year: "2022–24",
    problem: {
      es: "Mejorar rendimiento y UX de una plataforma en producción.",
      en: "Improve performance and UX of a production platform.",
    },
    solution: {
      es: "Interfaces y APIs optimizadas sobre infraestructura AWS.",
      en: "Optimized interfaces and APIs on AWS infrastructure.",
    },
    result: {
      es: "APIs más rápidas, consultas optimizadas y mejor experiencia.",
      en: "Faster APIs, optimized queries and a better experience.",
    },
    tech: ["Vue", "React", "Angular", "Java", "AWS"],
    links: { repo: "https://github.com/AlexLar163" },
  },
];
