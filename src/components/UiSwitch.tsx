"use client";

import { useTranslations } from "next-intl";
import { sound } from "@/lib/sound";

/**
 * Toggles the whole site between the "pixel" (8-bit) and "editorial"
 * interfaces. The choice lives in `document.documentElement.dataset.ui`
 * (set pre-paint by an inline script) and is persisted in localStorage.
 */
export function UiSwitch({ variant = "pixel" }: { variant?: "pixel" | "editorial" }) {
  const t = useTranslations("ui");

  const toggle = () => {
    const root = document.documentElement;
    const next = root.dataset.ui === "editorial" ? "pixel" : "editorial";
    root.dataset.ui = next;
    // Persist in a cookie so the server can render the chosen interface on the
    // next load (no flash) and keep localStorage for the no-JS theme fallback.
    document.cookie = `ui=${next}; path=/; max-age=31536000; samesite=lax`;
    try {
      window.localStorage.setItem("ui", next);
    } catch {}
    window.dispatchEvent(new Event("uichange"));
    sound.beep(700, 0.05);
    window.scrollTo({ top: 0 });
  };

  const label = `⇄ ${variant === "pixel" ? t("toEditorial") : t("toPixel")}`;

  return (
    <button
      className={variant === "pixel" ? "ui-switch" : "ed-uiswitch"}
      onClick={toggle}
      title={t("switch")}
      aria-label={t("switch")}
    >
      {label}
    </button>
  );
}
