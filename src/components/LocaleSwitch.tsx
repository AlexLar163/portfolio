"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { sound } from "@/lib/sound";

export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <span className="lang-switch" role="group" aria-label="Language">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          className="icon-btn"
          aria-pressed={loc === locale}
          onClick={() => {
            sound.beep(700, 0.05);
            router.replace(pathname, { locale: loc });
          }}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </span>
  );
}
