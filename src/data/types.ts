import type { Locale } from "@/i18n/routing";

/** A string available in every supported locale. */
export type Localized = Record<Locale, string>;

/** Pick the right language out of a Localized value. */
export function t(value: Localized, locale: Locale): string {
  return value[locale] ?? value.es;
}

export interface SocialLink {
  id: string;
  label: string;
  /** Shown in the 8-bit UI, e.g. "AlexLar163 →". */
  handle: string;
  href: string;
}

export interface SkillCategory {
  id: string;
  /** Category label per locale (e.g. Frontend / Cloud). */
  name: Localized;
  /** Plain tool names — order matters, render as-is. */
  tools: string[];
}

export interface Project {
  id: string;
  title: string;
  /** Groups the project under "Personal projects" or "Work". */
  category: "personal" | "work";
  /** Quest type shown in the header, e.g. "Main Quest". */
  kind: Localized;
  year: string;
  featured?: boolean;
  /** Case study fields. */
  problem: Localized;
  solution: Localized;
  result: Localized;
  tech: string[];
  links?: {
    demo?: string;
    repo?: string;
  };
}

export interface ExperienceItem {
  id: string;
  role: Localized;
  company: string;
  period: Localized;
  description: Localized;
}

export interface Stat {
  id: string;
  label: Localized;
  value: string;
}

export interface Profile {
  name: string;
  role: Localized;
  tagline: Localized;
  /** Two-line console summary used by the hero. */
  summary: Localized;
  email: string;
  cvUrl?: string;
  socials: SocialLink[];
  stats: Stat[];
  /** Core technologies highlighted in the hero. */
  core: string[];
}
