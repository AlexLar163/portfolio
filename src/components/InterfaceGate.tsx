"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders ONLY the active interface (not both), keeping the DOM light and
 * stopping the 8-bit game work when the editorial skin is shown.
 *
 * The 8-bit layout is the SSR default (so crawlers index the content once);
 * the editorial layout is passed as a prop and mounted client-side when chosen.
 */
export function InterfaceGate({
  initialMode,
  pixel,
  editorial,
}: {
  initialMode: "pixel" | "editorial";
  pixel: ReactNode;
  editorial: ReactNode;
}) {
  // Seeded from a server-read cookie, so the SSR markup already matches the
  // chosen interface — no pixel→editorial flash on reload.
  const [mode, setMode] = useState<"pixel" | "editorial">(initialMode);

  useEffect(() => {
    const read = () =>
      setMode(
        document.documentElement.dataset.ui === "editorial"
          ? "editorial"
          : "pixel",
      );
    window.addEventListener("uichange", read);
    return () => window.removeEventListener("uichange", read);
  }, []);

  return <>{mode === "editorial" ? editorial : pixel}</>;
}
