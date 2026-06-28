import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { experience } from "@/data/experience";
import { t } from "@/data/types";

export function Levels() {
  const tr = useTranslations("sections");
  const locale = useLocale() as Locale;

  return (
    <section className="section" id="levels">
      <h2 className="sec-title">
        <span className="a">&gt;</span> {tr("levels")}
      </h2>
      <span className="label">{tr("levelsSub")}</span>

      <div className="levels">
        {experience.map((item, i) => (
          <div key={item.id} className="box level">
            <span className="badge">
              {i === 0 ? "NOW" : t(item.period, locale).split(" ")[1] ?? "★"}
            </span>
            <div>
              <h4>{t(item.role, locale).toUpperCase()}</h4>
              <div className="co">
                {item.company} · {t(item.period, locale)}
              </div>
              <p>{t(item.description, locale)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
