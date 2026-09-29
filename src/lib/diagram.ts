import type { Point } from "@/data/types";

/**
 * Parte las subetiquetas en líneas según el presupuesto de caracteres del nodo.
 * Los segmentos se unen con « · »; un segmento más largo que el presupuesto se
 * parte por palabras. Nunca se achica la letra (DISENO §3.3.1).
 */
export function wrapSegments(segments: string[], budget: number): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const seg of segments) {
    const joined = cur ? `${cur} · ${seg}` : seg;
    if (joined.length <= budget) {
      cur = joined;
      continue;
    }
    if (cur) lines.push(cur);
    cur = "";
    if (seg.length <= budget) {
      cur = seg;
      continue;
    }
    for (const word of seg.split(" ")) {
      const next = cur ? `${cur} ${word}` : word;
      if (next.length <= budget) cur = next;
      else {
        if (cur) lines.push(cur);
        cur = word;
      }
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Polilínea ortogonal → path con quiebres redondeados de radio `r`. */
export function roundedPath(pts: Point[], r = 8): string {
  if (pts.length === 0) return "";
  const f = (n: number) => Math.round(n * 100) / 100;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const d1 = Math.hypot(cx - px, cy - py);
    const d2 = Math.hypot(nx - cx, ny - cy);
    const rr = Math.min(r, d1 / 2, d2 / 2);
    const ax = cx + ((px - cx) / d1) * rr;
    const ay = cy + ((py - cy) / d1) * rr;
    const bx = cx + ((nx - cx) / d2) * rr;
    const by = cy + ((ny - cy) / d2) * rr;
    d += ` L${f(ax)} ${f(ay)} Q${f(cx)} ${f(cy)} ${f(bx)} ${f(by)}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  d += ` L${f(lx)} ${f(ly)}`;
  return d;
}
