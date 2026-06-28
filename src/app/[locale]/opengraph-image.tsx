import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

export const alt = "Alex Largo — Fullstack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#d8c4a0",
          backgroundImage:
            "radial-gradient(#2e211420 1.5px, transparent 1.5px)",
          backgroundSize: "26px 26px",
          color: "#2e2114",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 6, color: "#6b573a" }}>
          ★ FULLSTACK DEVELOPER
        </div>
        <div
          style={{
            fontSize: 138,
            fontWeight: 800,
            color: "#c0392b",
            lineHeight: 1,
            marginTop: 8,
            textShadow: "6px 6px 0 #2e2114",
          }}
        >
          ALEX LARGO
        </div>
        <div style={{ fontSize: 34, marginTop: 28, color: "#2e2114" }}>
          React · NestJS · AWS · Next.js · TypeScript
        </div>
        <div style={{ display: "flex", gap: "12px", marginTop: 44 }}>
          {profile.core.map((tech) => (
            <div
              key={tech}
              style={{
                border: "4px solid #2e2114",
                background: "#e9dcc0",
                padding: "10px 18px",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
