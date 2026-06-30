import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { profile } from "@/data/profile";
import { skills } from "@/data/skills";
import { projects } from "@/data/projects";
import { experience } from "@/data/experience";
import { t, type Project } from "@/data/types";
import { ContributionGraph } from "@/components/ContributionGraph";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { UiSwitch } from "@/components/UiSwitch";
import { EditorialContact } from "./EditorialContact";
import { EditorialReveals } from "./EditorialReveals";

export function EditorialApp() {
  const e = useTranslations("editorial");
  const tq = useTranslations("quest");
  const locale = useLocale() as Locale;

  const github = profile.socials.find((s) => s.id === "github");
  const personal = projects.filter((p) => p.category === "personal");
  const work = projects.filter((p) => p.category === "work");

  const projectCard = (p: Project) => (
    <article key={p.id} className="ed-project">
      <header>
        <h3>{t(p.title, locale)}</h3>
        <span>{p.year}</span>
      </header>
      <div className="ed-case">
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
      <div className="ed-tags">
        {p.tech.map((tech) => (
          <span key={tech}>{tech}</span>
        ))}
      </div>
      {p.links && (
        <div className="ed-links">
          {p.links.demo && (
            <a href={p.links.demo} target="_blank" rel="noreferrer">
              {tq("demo")} ↗
            </a>
          )}
          {p.links.repo && (
            <a href={p.links.repo} target="_blank" rel="noreferrer">
              {tq("code")} ↗
            </a>
          )}
        </div>
      )}
    </article>
  );

  return (
    <div className="ed">
      <div className="ed-grain" aria-hidden="true" />
      <EditorialReveals />
      <header className="ed-nav">
        <span className="ed-logo">{profile.name}.</span>
        <nav>
          <a href="#ed-skills">{e("skills")}</a>
          <a href="#ed-projects">{e("projects")}</a>
          <a href="#ed-exp">{e("experience")}</a>
          <a href="#ed-contact">{e("contact")}</a>
        </nav>
        <span className="ed-controls">
          <LocaleSwitch />
          <UiSwitch variant="editorial" />
        </span>
      </header>

      <section className="ed-hero">
        <p className="ed-role">
          {t(profile.role, locale)} · NTT Data
        </p>
        <h1>{profile.name}</h1>
        <p className="ed-lead">{t(profile.summary, locale)}</p>
        <div className="ed-cta">
          <a className="ed-btn ed-btn-solid" href="#ed-projects">
            {e("viewProjects")}
          </a>
          {github && (
            <a
              className="ed-btn"
              href={github.href}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          )}
        </div>
        <div className="ed-core">
          {profile.core.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
        <p className="ed-available">{e("available")}</p>
      </section>

      <section className="ed-section" id="ed-skills">
        <h2>
          <span>01</span> {e("skills")}
        </h2>
        <div className="ed-skills">
          {skills.map((cat) => (
            <div key={cat.id} className="ed-skillcard">
              <h4>{t(cat.name, locale)}</h4>
              <div>
                {cat.tools.map((tool) => (
                  <span key={tool}>{tool}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="ed-section" id="ed-projects">
        <h2>
          <span>02</span> {e("projects")}
        </h2>
        {personal.length > 0 && (
          <>
            <h3 className="ed-group">{e("personal")}</h3>
            <div className="ed-projects">{personal.map(projectCard)}</div>
          </>
        )}
        {work.length > 0 && (
          <>
            <h3 className="ed-group">{e("work")}</h3>
            <div className="ed-projects">{work.map(projectCard)}</div>
          </>
        )}
      </section>

      <section className="ed-section" id="ed-exp">
        <h2>
          <span>03</span> {e("experience")}
        </h2>
        <div className="ed-timeline">
          {experience.map((item) => (
            <div key={item.id} className="ed-exp">
              <div className="ed-period">{t(item.period, locale)}</div>
              <h4>{t(item.role, locale)}</h4>
              <div className="ed-company">{item.company}</div>
              <p>{t(item.description, locale)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ed-section" id="ed-github">
        <h2>
          <span>04</span> {e("github")}
        </h2>
        <ContributionGraph />
        <div className="ed-ghstats">
          {profile.stats.map((s) => (
            <span key={s.id}>
              {t(s.label, locale)} <b>{s.value}</b>
            </span>
          ))}
          {github && (
            <a
              className="ed-btn"
              href={github.href}
              target="_blank"
              rel="noreferrer"
            >
              {e("viewProfile")} ↗
            </a>
          )}
        </div>
      </section>

      <section className="ed-section" id="ed-contact">
        <h2>
          <span>05</span> {e("contact")}
        </h2>
        <div className="ed-contact">
          <div>
            <h3>{e("contactTitle")}</h3>
            <p className="ed-lead">{e("contactLead")}</p>
            <div className="ed-channels">
              {profile.socials.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  <b>{s.label}</b>
                  <span>{s.handle}</span>
                </a>
              ))}
            </div>
          </div>
          <EditorialContact />
        </div>
      </section>

      <footer className="ed-foot">
        © 2026 {profile.name} · {t(profile.role, locale)}
      </footer>
    </div>
  );
}
