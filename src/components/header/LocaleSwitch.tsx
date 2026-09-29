"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/** Selector segmentado «ES | EN». */
export function LocaleSwitch({ label }: { label: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <span className="locale" role="group" aria-label={label}>
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          lang={loc}
          aria-pressed={loc === locale}
          onClick={() => {
            if (loc !== locale) router.replace(pathname, { locale: loc });
          }}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </span>
  );
}
