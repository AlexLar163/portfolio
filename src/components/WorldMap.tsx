import { useTranslations } from "next-intl";
import { profile } from "@/data/profile";
import { ContributionGraph } from "./ContributionGraph";

export function WorldMap() {
  const tr = useTranslations("sections");
  const tm = useTranslations("map");
  const github = profile.socials.find((s) => s.id === "github");
  const repos = profile.stats.find((s) => s.id === "repos")?.value ?? "—";
  const years = profile.stats.find((s) => s.id === "years")?.value ?? "—";

  return (
    <section className="section">
      <h2 className="sec-title">
        <span className="a">&gt;</span> {tr("map")}
      </h2>
      <span className="label">GITHUB @AlexLar163</span>

      <div style={{ marginTop: 18 }}>
        <ContributionGraph />
      </div>

      <div className="ghstats">
        <span className="ghchip">
          {tm("repos")} <b>{repos}</b>
        </span>
        <span className="ghchip">
          {tm("years")} <b>{years}</b>
        </span>
        <span className="ghchip">
          {tm("top")} <b>TS·JS</b>
        </span>
        {github && (
          <a
            className="pixel-btn go"
            href={github.href}
            target="_blank"
            rel="noreferrer"
          >
            {tm("viewProfile")}
          </a>
        )}
      </div>
    </section>
  );
}
