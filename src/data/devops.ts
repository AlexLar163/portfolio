import type { MediaRef } from "./types";

/**
 * Sección DevOps. Textos en messages → `devops`.
 * `tools` alimenta el énfasis de la matriz de Stack (se deriva, no se escribe a mano).
 */
export const capabilityGroups: {
  id: string;
  tools: string[];
  media?: MediaRef[];
}[] = [
  { id: "provisioning", tools: ["Ubuntu", "Docker", "ufw", "fail2ban", "Bash", "DigitalOcean"] },
  { id: "proxy", tools: ["Caddy", "Let's Encrypt"] },
  { id: "containers", tools: ["Docker Compose", "MariaDB", "WordPress", "wp-cli"] },
  {
    id: "panel",
    tools: ["Fastify", "TypeScript", "systemd", "Docker"],
    // Recursos del droplet (recortado sin pestañas ni Host) + lista de proyectos.
    // El modal de logs no se usa: mostraba la URL de un repo y un bug abierto.
    media: [
      { slug: "appsmonitor", key: "recursos" },
      { slug: "appsmonitor", key: "proyectos", position: "top" },
    ],
  },
  { id: "backups", tools: ["wp-cli", "n8n"] },
  { id: "monitoring", tools: ["cron", "n8n", "Telegram Bot API"] },
  {
    id: "automation",
    tools: ["n8n", "Claude Code", "Anthropic SDK", "Express", "Docker", "PostgreSQL"],
    media: [{ slug: "automatizaciones", key: "portada" }],
  },
  {
    id: "clouds",
    tools: ["Vercel", "Neon", "AWS", "EKS", "RDS", "EC2", "SSM", "Route53", "CloudWatch", "Cloudflare", "Terraform", "Helm", "KEDA", "Karpenter", "Istio"],
  },
  { id: "qa", tools: ["Playwright"] },
];

/** CI/CD. `target` y los pasos traducibles están en messages → `devops.pipeline.rows.<id>`. */
export const pipelineRows = [
  { id: "appsmonitor", project: "appsMonitor", tools: ["GitHub Actions"] },
  { id: "finansfit-web", project: "finansfit-web", tools: ["GitHub Actions", "Vitest"] },
  { id: "medicalapp", project: "medicalApp", tools: ["GitHub Actions", "Playwright"] },
  { id: "evaluar", project: "Evaluar", tools: ["Docker", "EKS", "Kubernetes"] },
  { id: "trompo", project: "Trompo", tools: ["Docker Compose", "Nginx"] },
] as const;

export const incidentSteps = ["detect", "rescue", "rebuild", "harden"] as const;
