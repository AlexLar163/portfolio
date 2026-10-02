import { ImageResponse } from "next/og";

/** Generador único de imágenes OG (home, casos, postmortem): misma retícula y cadena de nodos. */
export const OG_SIZE = { width: 1200, height: 630 };

/**
 * ImageResponse no lee fuentes variables: se pide Archivo como TTF estático a
 * Google (sin user-agent moderno, Google responde truetype). Si la red falla en
 * el build, se dibuja con la sans por defecto en vez de romper.
 */
async function archivo(weight: 600 | 700): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Archivo:wght@${weight}`)
    ).text();
    const url = css.match(/src: url\(([^)]+)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

export async function renderOg({
  title,
  sub,
  eyebrow,
  nodes,
  accent,
}: {
  title: string;
  sub: string;
  /** Rótulo chico sobre el título (p. ej. «Caso de estudio · Cliente real»). */
  eyebrow?: string;
  nodes: string[];
  /** Nodo en acento; por defecto, el último. */
  accent?: string;
}) {
  const [bold, semi] = await Promise.all([archivo(700), archivo(600)]);
  const fonts = [
    bold && { name: "Archivo", data: bold, weight: 700 as const, style: "normal" as const },
    semi && { name: "Archivo", data: semi, weight: 600 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 600 | 700; style: "normal" }[];
  const hot = accent ?? nodes[nodes.length - 1];
  // Títulos largos (casos) bajan de cuerpo para caber en dos líneas.
  // El cuerpo grande es el de la home, idéntico al aprobado.
  // Las subpáginas (con rótulo) usan siempre el cuerpo de caso: mismo tamaño en las 10.
  const long = !!eyebrow || title.length > 28;
  const t = long ? { size: 68, lh: 1.05, ls: -2, sub: 34 } : { size: 104, lh: 1, ls: -3, sub: 44 };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "88px 88px 72px",
          background: "#0D0F11",
          backgroundImage: "radial-gradient(#3B434C 1px, transparent 1.5px)",
          backgroundSize: "24px 24px",
          color: "#ECE9E2",
          fontFamily: "Archivo",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow && (
            <div style={{ fontSize: 26, fontWeight: 600, color: "#FF8B3D", marginBottom: 20 }}>{eyebrow}</div>
          )}
          <div style={{ fontSize: t.size, fontWeight: 700, lineHeight: t.lh, letterSpacing: t.ls }}>{title}</div>
          <div style={{ fontSize: t.sub, fontWeight: 600, color: "#B3B9BF", marginTop: 20 }}>{sub}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {nodes.map((n, i) => (
            <div key={n} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  padding: "14px 22px",
                  fontSize: 26,
                  fontWeight: 600,
                  background: "#1B1F23",
                  border: `2px solid ${n === hot ? "#FF8B3D" : "#3B434C"}`,
                  borderRadius: 6,
                }}
              >
                {n}
              </div>
              {i < nodes.length - 1 && (
                <div
                  style={{
                    width: 56,
                    height: 2,
                    background: n === hot || nodes[i + 1] === hot ? "#FF8B3D" : "#3B434C",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}
