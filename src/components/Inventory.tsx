import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { skills } from "@/data/skills";
import { t } from "@/data/types";

export function Inventory() {
  const tr = useTranslations("sections");
  const locale = useLocale() as Locale;

  return (
    <section className="section" id="skills">
      <h2 className="sec-title">
        <span className="a">&gt;</span> {tr("inventory")}
      </h2>
      <span className="label">{tr("inventorySub")}</span>

      <div className="inv">
        {skills.map((cat) => (
          <div key={cat.id} className="box slot">
            <h3>{t(cat.name, locale)}</h3>
            <div>
              {cat.tools.map((tool) => (
                <span key={tool}>{tool}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
