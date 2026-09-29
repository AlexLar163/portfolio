import type { ExperienceItem } from "./types";

/**
 * Experiencia, de la más nueva a la más vieja. Rol y descripción en messages →
 * `experience.items.<id>`. El período se formatea con Intl desde `start`/`end`.
 * NTT DATA: rol y fecha tal como están en el CV vigente (Junior Engineer, mar 2025).
 */
export const experience: ExperienceItem[] = [
  {
    id: "freelance",
    company: "Workana",
    start: "2026-01",
    parallelWith: "ntt",
    tech: ["WordPress", "Next.js", "Docker", "Caddy", "n8n", "Neon"],
  },
  {
    id: "ntt",
    company: "NTT DATA",
    start: "2025-03",
    parallelWith: "freelance",
    tech: ["Java", "AWS", "EKS", "Helm", "Terraform", "Oracle", "Linux", "S3", "Kubernetes"],
  },
  {
    id: "evaluar-fs",
    company: "Evaluar",
    start: "2024-03",
    end: "2024-05",
    tech: ["Vue", "React", "NestJS", "Java", "DynamoDB"],
  },
  {
    id: "evaluar-fe",
    company: "Evaluar",
    start: "2022-03",
    end: "2023-04",
    tech: ["Vue", "React", "Angular", "Storybook", "Jest"],
  },
  {
    id: "trompo-gad",
    company: "Trompo · GAD San Fernando",
    start: "2021-06",
    end: "2022-01",
    tech: ["Next.js", "NestJS", "PostgreSQL", "React Native", "Docker"],
  },
];

export const education = { year: "2024-06" };
