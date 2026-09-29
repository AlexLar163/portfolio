import { ImageResponse } from "next/og";

export const alt = "Alex Largo — Fullstack & DevOps Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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

export default async function OpengraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const NODES = [locale === "en" ? "Visitors" : "Visitantes", "DNS", "Caddy", "WordPress · n8n"];
  const [bold, semi] = await Promise.all([archivo(700), archivo(600)]);
  const fonts = [
    bold && { name: "Archivo", data: bold, weight: 700 as const, style: "normal" as const },
    semi && { name: "Archivo", data: semi, weight: 600 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 600 | 700; style: "normal" }[];

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
          <div style={{ fontSize: 104, fontWeight: 700, lineHeight: 1, letterSpacing: -3 }}>
            Alex Largo
          </div>
          <div style={{ fontSize: 44, fontWeight: 600, color: "#B3B9BF", marginTop: 20 }}>
            Fullstack & DevOps Engineer
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {NODES.map((n, i) => (
            <div key={n} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  padding: "14px 22px",
                  fontSize: 26,
                  fontWeight: 600,
                  background: "#1B1F23",
                  border: `2px solid ${n === "Caddy" ? "#FF8B3D" : "#3B434C"}`,
                  borderRadius: 6,
                }}
              >
                {n}
              </div>
              {i < NODES.length - 1 && (
                <div
                  style={{
                    width: 56,
                    height: 2,
                    background: n === "Caddy" || NODES[i + 1] === "Caddy" ? "#FF8B3D" : "#3B434C",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
