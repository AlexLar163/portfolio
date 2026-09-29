import { getTranslations } from "next-intl/server";
import { normalizeTool, skills, usedTools } from "@/data/skills";
import { Section } from "@/components/ui/Section";

/** Matriz de stack. El énfasis se DERIVA de los proyectos de la página (DISENO §3.6). */
export async function Stack() {
  const t = await getTranslations("stack");
  return (
    <Section id="stack" title={t("title")}>
      <div>
        {skills.map((cat) => (
          <div key={cat.id} className="grid skills__row">
            <h3>{t(`categories.${cat.id}`)}</h3>
            <ul className="skills__tools">
              {cat.tools.map((tool) => (
                <li key={tool} className={usedTools.has(normalizeTool(tool)) ? "is-used" : undefined}>
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="skills__legend t-small">{t("legend")}</p>
    </Section>
  );
}
