import type { SkillCategory } from "./types";
import { clients } from "./clients";
import { showcase } from "./showcase";
import { capabilityGroups, pipelineRows } from "./devops";
import { experience } from "./experience";

/** Matriz de Stack. Nombres de categoría en messages → `stack.categories.<id>`. */
export const skills: SkillCategory[] = [
  {
    id: "infra",
    tools: ["Docker", "Docker Compose", "Caddy", "Nginx", "Linux", "Ubuntu", "Bash", "systemd", "cron", "ufw", "fail2ban", "GitHub Actions", "DigitalOcean", "Cloudflare", "Vercel"],
  },
  {
    id: "aws",
    tools: ["AWS", "EKS", "EC2", "SSM", "RDS", "S3", "Route53", "CloudWatch", "Transit Gateway", "Kubernetes", "Helm", "KEDA", "Karpenter", "Istio", "Terraform"],
  },
  {
    id: "automation",
    tools: ["n8n", "Claude Code", "Anthropic SDK", "Telegram Bot API", "Gmail API", "Python"],
  },
  {
    id: "backend",
    tools: ["Node.js", "NestJS", "Express", "Fastify", "Better Auth", "Java", "Spring Boot", "PHP", "REST API", "GraphQL"],
  },
  {
    id: "frontend",
    tools: ["React", "Next.js", "TypeScript", "JavaScript", "Vue", "Nuxt", "Angular", "Tailwind", "HTML", "CSS", "Redux", "Storybook"],
  },
  {
    id: "data",
    tools: ["PostgreSQL", "Neon", "MariaDB", "MySQL", "Oracle", "MongoDB", "DynamoDB", "SQLite", "Drizzle", "TypeORM", "Dexie", "Redis"],
  },
  { id: "mobile", tools: ["React Native", "Expo", "Flutter", "NativeWind"] },
  {
    id: "cms",
    tools: ["WordPress", "WooCommerce", "Elementor", "TranslatePress", "Systeme.io", "Temenos"],
  },
  { id: "testing", tools: ["Playwright", "Vitest", "Jest", "Testing Library", "Lighthouse"] },
];

/** Alias de nombres que aparecen en proyectos con otra forma. */
const ALIAS: Record<string, string> = {
  "AWS EKS": "EKS",
  "AWS EC2": "EC2",
  "Neon Postgres": "Neon",
  Postgres: "PostgreSQL",
  Telegram: "Telegram Bot API",
};

/** «Next.js 16» → «Next.js». */
export function normalizeTool(name: string): string {
  const base = name.replace(/\s+\d+(\.\d+)*$/, "");
  return ALIAS[base] ?? base;
}

/**
 * Herramientas que aparecen en algún proyecto de la página (clientes, demos,
 * DevOps, CI/CD, experiencia). Se calcula en build: la matriz no puede mentir.
 */
export const usedTools: Set<string> = new Set(
  [
    ...clients.flatMap((c) => c.tech),
    ...showcase.flatMap((s) => s.tech),
    ...capabilityGroups.flatMap((g) => g.tools),
    ...pipelineRows.flatMap((r) => r.tools),
    ...experience.flatMap((e) => e.tech ?? []),
  ].map(normalizeTool),
);
