import { useTranslations } from "next-intl";
import { LocaleSwitch } from "./LocaleSwitch";
import { SoundToggle } from "./SoundToggle";
import { UiSwitch } from "./UiSwitch";

export function Hud() {
  const tr = useTranslations("hud");
  return (
    <div className="hud">
      <span className="logo">
        ALEX<span style={{ color: "var(--accent)" }}>.</span>EXE
      </span>
      <nav>
        <a href="#about">{tr("about")}</a>
        <a href="#skills">{tr("skills")}</a>
        <a href="#quests">{tr("quests")}</a>
        <a href="#levels">{tr("levels")}</a>
        <a href="#contact">{tr("talk")}</a>
      </nav>
      <span className="hud-right">
        <span className="online" title={tr("online")}>
          P1 <i>●</i>
        </span>
        <SoundToggle />
        <LocaleSwitch />
        <UiSwitch variant="pixel" />
      </span>
    </div>
  );
}
