import type { InfraEdge, InfraNode, InfraRoute } from "./types";

/**
 * Diagrama de infraestructura. Dos composiciones con los mismos nodos y aristas:
 *   land → viewBox 0 0 1200 704 (horizontal)
 *   port → viewBox 0 0 360 1824 (vertical)
 * Textos (etiqueta, subetiquetas, detalle, hechos) en messages → `infra.nodes.<id>`.
 *
 * Sin IPs ni hostnames internos. `*.taller.works` es el dominio público de las demos.
 * El «detector en Python» se omite a propósito (DISENO §3.3.1).
 *
 * La composición vertical NO es la de DISENO: la franja del host y el cron quedaban
 * entre DNS y Caddy y el tronco de Caddy los atravesaba. Aquí el host y el cron van
 * al pie del VPS, el bus de Caddy baja por el margen izquierdo de la red Docker y
 * GitHub Actions entra por abajo. Mismos nodos, mismas aristas.
 */

export const VIEWBOX = {
  land: { w: 1200, h: 704 },
  port: { w: 360, h: 1824 },
} as const;

/** Métricas tipográficas en unidades del viewBox (piso de 12 px renderizados). */
export const TYPE = {
  land: { label: 16, sub: 13, edge: 14, frame: 14, charW: 7.8, labelY: 24, subY: 44, step: 17 },
  port: { label: 18, sub: 15, edge: 15, frame: 15, charW: 9, labelY: 26, subY: 48, step: 19 },
} as const;

export const nodes: InfraNode[] = [
  { id: "visitors", kind: "external", interactive: true, land: { x: 0, y: 136, w: 184, h: 72 }, port: { x: 0, y: 0, w: 172, h: 80 } },
  { id: "telegram", kind: "external", interactive: true, land: { x: 0, y: 280, w: 184, h: 72 }, port: { x: 188, y: 0, w: 172, h: 80 } },
  { id: "dns", kind: "service", interactive: true, land: { x: 216, y: 136, w: 168, h: 72 }, port: { x: 0, y: 104, w: 172, h: 80 } },
  { id: "github", kind: "external", interactive: true, land: { x: 0, y: 40, w: 184, h: 72 }, port: { x: 0, y: 1416, w: 360, h: 72 } },

  { id: "vps", kind: "boundary", interactive: false, land: { x: 416, y: 16, w: 784, h: 560 }, port: { x: 0, y: 208, w: 360, h: 1184 } },
  { id: "host", kind: "strip", interactive: true, land: { x: 432, y: 80, w: 752, h: 40 }, port: { x: 16, y: 1264, w: 328, h: 104 } },
  { id: "caddy", kind: "service", interactive: true, land: { x: 432, y: 144, w: 176, h: 136 }, port: { x: 16, y: 296, w: 328, h: 88 } },
  { id: "cron", kind: "service", interactive: true, land: { x: 432, y: 320, w: 176, h: 88 }, port: { x: 16, y: 1152, w: 328, h: 88 } },

  { id: "docker", kind: "boundary", interactive: false, land: { x: 632, y: 144, w: 552, h: 392 }, port: { x: 16, y: 408, w: 328, h: 720 } },
  { id: "appsmonitor", kind: "service", interactive: true, land: { x: 648, y: 288, w: 252, h: 88 }, port: { x: 44, y: 472, w: 284, h: 88 } },
  { id: "wordpress", kind: "on-demand", interactive: true, land: { x: 648, y: 184, w: 252, h: 88 }, port: { x: 44, y: 584, w: 284, h: 88 } },
  { id: "mariadb", kind: "service", interactive: true, land: { x: 916, y: 184, w: 252, h: 88 }, port: { x: 44, y: 696, w: 284, h: 80 } },
  { id: "wpcli", kind: "service", interactive: true, land: { x: 916, y: 288, w: 120, h: 88 }, port: { x: 44, y: 800, w: 136, h: 64 } },
  { id: "backups", kind: "service", interactive: true, land: { x: 1048, y: 288, w: 120, h: 88 }, port: { x: 192, y: 800, w: 136, h: 64 } },
  { id: "runner", kind: "service", interactive: true, land: { x: 916, y: 400, w: 252, h: 104 }, port: { x: 44, y: 888, w: 284, h: 104 } },
  { id: "n8n", kind: "service", interactive: true, land: { x: 648, y: 400, w: 252, h: 104 }, port: { x: 44, y: 1016, w: 284, h: 88 } },

  { id: "vercel", kind: "cloud", interactive: true, land: { x: 0, y: 616, w: 280, h: 80 }, port: { x: 0, y: 1536, w: 360, h: 72 } },
  { id: "aws", kind: "cloud", interactive: true, land: { x: 304, y: 616, w: 560, h: 80 }, port: { x: 0, y: 1624, w: 360, h: 120 } },
  { id: "cloudflare", kind: "cloud", interactive: true, land: { x: 888, y: 616, w: 312, h: 80 }, port: { x: 0, y: 1760, w: 360, h: 64 } },
];

/** Posición del rótulo «Fuera del VPS». */
export const OUTSIDE_LABEL = { land: { x: 0, y: 600 }, port: { x: 0, y: 1520 } } as const;

/** Rótulo de las fronteras: arriba a la izquierda (vertical: entre las dos aristas que entran). */
export const FRAME_LABEL = {
  vps: { land: { x: 432, y: 40 }, port: { x: 104, y: 234 } },
  docker: { land: { x: 648, y: 166 }, port: { x: 44, y: 432 } },
} as const;

export const edges: InfraEdge[] = [
  { id: "e1", from: "visitors", to: "dns", type: "traffic", land: [[184, 172], [216, 172]], port: [[86, 80], [86, 104]] },
  { id: "e2", from: "dns", to: "caddy", type: "traffic", land: [[384, 172], [432, 172]], port: [[86, 184], [86, 296]] },
  { id: "trunk", from: "caddy", to: "bus", type: "traffic", land: [[608, 212], [624, 212], [624, 452]], port: [[30, 384], [30, 1060]] },
  { id: "e3", from: "caddy", to: "wordpress", type: "traffic", land: [[624, 228], [648, 228]], port: [[30, 628], [44, 628]] },
  { id: "e4", from: "caddy", to: "appsmonitor", type: "traffic", land: [[624, 332], [648, 332]], port: [[30, 516], [44, 516]] },
  { id: "e5", from: "caddy", to: "n8n", type: "traffic", land: [[624, 452], [648, 452]], port: [[30, 1060], [44, 1060]] },
  {
    id: "e6",
    from: "telegram",
    to: "caddy",
    type: "traffic",
    land: [[184, 316], [400, 316], [400, 248], [432, 248]],
    port: [[328, 80], [328, 296]],
    labelLand: { x: 192, y: 306, anchor: "start" },
    labelPort: { x: 318, y: 124, anchor: "end" },
  },
  { id: "e7", from: "n8n", to: "runner", type: "control", land: [[900, 452], [916, 452]], port: [[186, 1016], [186, 992]] },
  { id: "e8", from: "appsmonitor", to: "wordpress", type: "control", land: [[774, 288], [774, 272]], port: [[186, 560], [186, 584]] },
  { id: "e9", from: "wordpress", to: "mariadb", type: "traffic", land: [[900, 228], [916, 228]], port: [[186, 672], [186, 696]] },
  { id: "e10", from: "wpcli", to: "mariadb", type: "control", land: [[976, 288], [976, 272]], port: [[112, 800], [112, 776]] },
  { id: "e11", from: "backups", to: "mariadb", type: "scheduled", land: [[1108, 288], [1108, 272]], port: [[260, 800], [260, 776]] },
  { id: "e12", from: "cron", to: "n8n", type: "scheduled", land: [[520, 408], [520, 476], [648, 476]], port: [[112, 1152], [112, 1104]] },
  { id: "e13", from: "github", to: "host", type: "control", land: [[184, 76], [400, 76], [400, 100], [432, 100]], port: [[180, 1416], [180, 1368]] },
];

/**
 * Recorridos del trazo (DISENO §6.3). Son un solo path continuo que pasa POR DEBAJO
 * de los nodos (los nodos tienen relleno opaco): el tramo interno queda tapado y el
 * trazo parece «atravesar» cada servicio.
 */
export const routes: InfraRoute[] = [
  {
    id: 1,
    edges: ["e1", "e2", "trunk", "e3"],
    land: [[184, 172], [600, 172], [600, 212], [624, 212], [624, 228], [648, 228]],
    port: [[86, 80], [86, 330], [30, 330], [30, 628], [44, 628]],
  },
  {
    id: 2,
    edges: ["e6", "trunk", "e5", "e7"],
    land: [[184, 316], [400, 316], [400, 248], [600, 248], [600, 212], [624, 212], [624, 452], [916, 452]],
    port: [[328, 80], [328, 330], [30, 330], [30, 1060], [186, 1060], [186, 992]],
  },
];

/** Orden del tráfico para la lista alternativa (<details>). */
export const listOrder = [
  "visitors",
  "dns",
  "caddy",
  "telegram",
  "wordpress",
  "mariadb",
  "wpcli",
  "backups",
  "appsmonitor",
  "n8n",
  "runner",
  "cron",
  "host",
  "github",
  "vercel",
  "aws",
  "cloudflare",
];

export const DEFAULT_NODE = "caddy";
