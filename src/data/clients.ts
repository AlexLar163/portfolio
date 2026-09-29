import type { Client } from "./types";

/** Clientes reales. Textos en messages → `clients.items.<id>`. */
export const clients: Client[] = [
  {
    id: "3destiny",
    name: "3Destiny",
    domain: "3destinyra.com",
    url: "https://3destinyra.com",
    year: "2026",
    status: "production",
    lead: true,
    tech: ["WordPress", "PHP", "AWS EC2", "Route53", "wp-cli"],
    media: {
      main: { slug: "3destiny", key: "portada" },
      video: { slug: "3destiny", key: "recorrido" },
      items: [
        { slug: "3destiny", key: "galeria-01" },
        { slug: "3destiny", key: "galeria-02" },
        { slug: "3destiny", key: "galeria-03" },
      ],
    },
  },
  {
    id: "orthodent",
    name: "Orthodent",
    domain: "orthodent.com.ec",
    // Hosting compartido del cliente: a veces devuelve 508. QA comprueba 200 antes de publicar.
    url: "https://orthodent.com.ec",
    year: "2026",
    status: "production",
    tech: ["WordPress", "Elementor", "WooCommerce", "TranslatePress"],
    media: {
      main: { slug: "orthodent", key: "portada" },
      inset: { slug: "orthodent", key: "movil" },
    },
  },
  {
    id: "argentina-local-expert",
    name: "Argentina Local Expert",
    domain: "argentinalocalexpert.com",
    // Con www: sin www el dominio muestra el placeholder del hosting.
    url: "https://www.argentinalocalexpert.com",
    year: "2026",
    status: "production",
    tech: ["Systeme.io"],
    review: { source: "Workana", stars: 5 },
    media: { main: { slug: "argentina-local-expert", key: "portada" } },
  },
  {
    id: "diamante",
    name: "Diamante",
    year: "2026",
    status: "in-progress",
    tech: ["React Native", "Expo"],
    demoUrl: "https://diamante-anotador-beisbol.vercel.app",
    // La fase 1 es móvil: la vista de teléfono va superpuesta.
    media: {
      main: { slug: "diamante", key: "portada" },
      inset: { slug: "diamante", key: "movil" },
    },
  },
];
