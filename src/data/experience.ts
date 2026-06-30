import type { ExperienceItem } from "./types";

/** Experience = "Level log". Newest first. Add as many as you want. */
export const experience: ExperienceItem[] = [
  {
    id: "ntt",
    role: { es: "Fullstack Developer", en: "Fullstack Developer" },
    company: "NTT Data",
    period: { es: "Actualidad", en: "Present" },
    description: {
      es: "Desarrollo de soluciones fullstack en proyectos empresariales.",
      en: "Fullstack solutions for enterprise projects.",
    },
  },
  {
    id: "evaluar-fs",
    role: { es: "Fullstack Developer", en: "Fullstack Developer" },
    company: "Evaluar",
    period: { es: "Mar 2024 — May 2024", en: "Mar 2024 — May 2024" },
    description: {
      es: "Vue, React, Nuxt, Next, NestJS y Java. Optimización de APIs y consultas; infraestructura AWS (S3, RDS, DynamoDB, ECS/ECR/EKS).",
      en: "Vue, React, Nuxt, Next, NestJS and Java. API and query optimization; AWS infrastructure (S3, RDS, DynamoDB, ECS/ECR/EKS).",
    },
  },
  {
    id: "evaluar-fe",
    role: { es: "Frontend Developer", en: "Frontend Developer" },
    company: "Evaluar",
    period: { es: "Mar 2022 — Abr 2023", en: "Mar 2022 — Apr 2023" },
    description: {
      es: "Interfaces con Vue, React y Angular. Responsive design y tests unitarios con Jest y Testing Library.",
      en: "Interfaces with Vue, React and Angular. Responsive design and unit tests with Jest and Testing Library.",
    },
  },
  {
    id: "trompo-gad",
    role: { es: "Fullstack Developer", en: "Fullstack Developer" },
    company: "Trompo · GAD San Fernando",
    period: { es: "2021 — 2022", en: "2021 — 2022" },
    description: {
      es: "Next.js + NestJS + PostgreSQL/MySQL, autenticación y despliegue con Docker en Vercel, Render y CentOS.",
      en: "Next.js + NestJS + PostgreSQL/MySQL, authentication and deployment with Docker on Vercel, Render and CentOS.",
    },
  },
];
