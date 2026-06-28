import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { profile } from "@/data/profile";
import { t } from "@/data/types";
import { avatarCells } from "@/lib/avatar";

export function Hero() {
  const tr = useTranslations("hero");
  const locale = useLocale() as Locale;
  const github = profile.socials.find((s) => s.id === "github");

  return (
    <header className="hero" id="about">
      <div className="avatar" aria-hidden="true">
        {avatarCells.map((color, i) => (
          <i key={i} style={{ background: color }} />
        ))}
      </div>
      <div className="avatar-shadow" aria-hidden="true" />

      <p className="pre">{tr("newGame")}</p>
      <h1 className="pixel">{profile.name.toUpperCase()}</h1>
      <p className="htitle pixel">{t(profile.role, locale).toUpperCase()}</p>
      <p className="hsub">{t(profile.summary, locale)}</p>

      <div className="cta">
        <a className="pixel-btn go" href="#quests">
          {tr("viewQuests")}
        </a>
        {profile.cvUrl && (
          <a className="pixel-btn" href={profile.cvUrl}>
            {tr("cv")}
          </a>
        )}
        {github && (
          <a
            className="pixel-btn"
            href={github.href}
            target="_blank"
            rel="noreferrer"
          >
            {tr("github")}
          </a>
        )}
      </div>

      <div className="xp">
        <div className="lab">
          <span>{tr("xp")}</span>
          <span>LVL 99</span>
        </div>
        <div className="track">
          <i />
        </div>
      </div>

      <p className="coin-line">▼ {tr("insertCoin")}</p>
    </header>
  );
}
