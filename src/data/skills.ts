import type { SkillCategory } from "./types";

/**
 * Add/remove categories or tools freely — the Inventory section
 * renders whatever is here, in any amount.
 */
export const skills: SkillCategory[] = [
  {
    id: "frontend",
    name: { es: "Frontend", en: "Frontend" },
    tools: [
      "React",
      "Vue",
      "Angular",
      "Next.js",
      "Nuxt.js",
      "Astro",
      "TypeScript",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Tailwind",
      "Sass",
      "Redux",
      "Storybook",
    ],
  },
  {
    id: "backend",
    name: { es: "Backend", en: "Backend" },
    tools: [
      "Node.js",
      "NestJS",
      "Express",
      "Java",
      "Spring Boot",
      "Quarkus",
      "Python",
      "GraphQL",
    ],
  },
  {
    id: "mobile",
    name: { es: "Móvil", en: "Mobile" },
    tools: ["Flutter", "React Native", "Expo", "NativeWind"],
  },
  {
    id: "databases",
    name: { es: "Bases de datos", en: "Databases" },
    tools: [
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "SQLite",
      "Drizzle ORM",
      "TypeORM",
      "Redis",
    ],
  },
  {
    id: "cloud",
    name: { es: "Cloud & DevOps", en: "Cloud & DevOps" },
    tools: [
      "AWS",
      "S3",
      "RDS",
      "DynamoDB",
      "ECS",
      "ECR",
      "EKS",
      "Kubernetes",
      "Helm",
      "Karpenter",
      "Terraform",
      "Docker",
      "GitHub Actions",
      "Git",
      "GitHub",
      "Nginx",
      "Linux",
      "Bash",
      "Vercel",
      "Render",
      "DigitalOcean",
      "CentOS",
    ],
  },
  {
    id: "testing",
    name: { es: "Testing", en: "Testing" },
    tools: ["Jest", "Testing Library", "Vitest"],
  },
  {
    id: "tools",
    name: { es: "Herramientas", en: "Tools" },
    tools: ["Postman", "Swagger / OpenAPI", "Figma"],
  },
];
