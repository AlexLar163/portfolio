import { getLocale, getTranslations } from "next-intl/server";
import { education, experience } from "@/data/experience";
import { normalizeTool, skills, usedTools } from "@/data/skills";
import type { ExperienceItem, SkillCategory } from "@/data/types";
import { formatMonth, formatPeriod } from "@/lib/format";
import { TechList } from "@/components/ui/primitives";

/** Filas visibles de Experiencia y de Stack; el resto va plegado (DISENO-v2 §3.2). */
const XP_VISIBLE = 2;
const STACK_VISIBLE = ["infra", "aws", "automation"];

/**
 * Trayectoria = Experiencia + Stack en una sección. `#stack` queda como subsección
 * (el ancla no cambia).
 */
export async function Trajectory() {
  const t = await getTranslations("experience");
  const st = await getTranslations("stack");
  const locale = await getLocale();

  const row = (e: ExperienceItem, i: number) => {
    const next = experience[i + 1];
    const parallel = e.parallelWith ? (next?.id === e.parallelWith ? "first" : "last") : undefined;
    return (
      <li key={e.id} className="xp__row" data-parallel={parallel}>
        <p className="xp__period t-data">
          {formatPeriod(e.start, e.end, locale, t("present"))}
          {parallel === "first" && <span className="xp__parallel">{t("parallel")}</span>}
        </p>
        <h3 className="xp__role t-h3">
          {t(`items.${e.id}.role`)}
          <span className="xp__company t-small">{e.company}</span>
        </h3>
        <div className="xp__desc">
          <p>{t(`items.${e.id}.summary`)}</p>
          {e.tech && (
            <p className="tech">
              <TechList items={e.tech} max={6} />
            </p>
          )}
        </div>
      </li>
    );
  };

  const skillRow = (cat: SkillCategory) => (
    <div key={cat.id} className="skills__row">
      <h3>{st(`categories.${cat.id}`)}</h3>
      <ul className="skills__tools">
        {cat.tools.map((tool) => (
          <li key={tool} className={usedTools.has(normalizeTool(tool)) ? "is-used" : undefined}>
            {tool}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section id="experiencia" aria-labelledby="experiencia-title" className="section trajectory">
      <div className="shell">
        <header className="section-head">
          <h2 id="experiencia-title" className="t-h2 rail-title" data-rail>
            {t("title")}
          </h2>
        </header>
        <div className="grid trajectory__grid">
          <div className="trajectory__xp">
            <ol className="xp">{experience.slice(0, XP_VISIBLE).map((e, i) => row(e, i))}</ol>
            <details className="disclosure">
              <summary>{t("earlier")}</summary>
              <div className="disclosure__body">
                <ol className="xp disclosure__inner">
                  {experience.slice(XP_VISIBLE).map((e, i) => row(e, i + XP_VISIBLE))}
                  <li className="xp__row xp__row--edu t-small">
                    <p className="xp__period t-data">{formatMonth(education.year, locale)}</p>
                    <p className="xp__role">
                      <span className="ink-3">{t("education.label")}</span>
                      <span className="xp__company">{t("education.degree")}</span>
                    </p>
                    <p className="xp__desc ink-2">{t("education.school")}</p>
                  </li>
                </ol>
              </div>
            </details>
          </div>

          <div id="stack" className="trajectory__stack" aria-labelledby="stack-title">
            <h3 id="stack-title" className="subhead">
              {st("title")}
            </h3>
            <div className="skills">{skills.filter((c) => STACK_VISIBLE.includes(c.id)).map(skillRow)}</div>
            <details className="disclosure">
              <summary>{st("all")}</summary>
              <div className="disclosure__body">
                <div className="skills disclosure__inner">
                  {skills.filter((c) => !STACK_VISIBLE.includes(c.id)).map(skillRow)}
                </div>
              </div>
            </details>
            <p className="skills__legend t-small">{st("legend")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
