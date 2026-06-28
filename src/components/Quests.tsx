import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { projects } from "@/data/projects";
import { t, type Project } from "@/data/types";

export function Quests() {
  const tr = useTranslations("sections");
  const tq = useTranslations("quest");
  const locale = useLocale() as Locale;

  const personal = projects.filter((p) => p.category === "personal");
  const work = projects.filter((p) => p.category === "work");

  const card = (p: Project) => (
    <article key={p.id} className={`box quest${p.featured ? " acc" : ""}`}>
      <div className="qh">
        <span>{t(p.kind, locale)}</span>
        <span>{p.year}</span>
      </div>
      <div className="qb">
        <h3>{p.title}</h3>
        <div className="case">
          <div>
            <b>{tq("problem")}</b>
            <p>{t(p.problem, locale)}</p>
          </div>
          <div>
            <b>{tq("solution")}</b>
            <p>{t(p.solution, locale)}</p>
          </div>
          <div>
            <b>{tq("result")}</b>
            <p>{t(p.result, locale)}</p>
          </div>
        </div>
        <div className="st">
          {p.tech.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
        {p.links && (
          <div className="lk">
            {p.links.demo && (
              <a
                className="pixel-btn go"
                href={p.links.demo}
                target="_blank"
                rel="noreferrer"
              >
                {tq("demo")}
              </a>
            )}
            {p.links.repo && (
              <a
                className="pixel-btn"
                href={p.links.repo}
                target="_blank"
                rel="noreferrer"
              >
                {tq("code")}
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );

  return (
    <section className="section" id="quests">
      <h2 className="sec-title">
        <span className="a">&gt;</span> {tr("quests")}
      </h2>
      <span className="label">{tr("questsSub")}</span>

      {personal.length > 0 && (
        <>
          <h3 className="quest-group">{tr("questsPersonal")}</h3>
          <div className="quests">{personal.map(card)}</div>
        </>
      )}

      {work.length > 0 && (
        <>
          <h3 className="quest-group">{tr("questsWork")}</h3>
          <div className="quests">{work.map(card)}</div>
        </>
      )}
    </section>
  );
}
