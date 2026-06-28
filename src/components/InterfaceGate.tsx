"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders ONLY the active interface (not both), keeping the DOM light and
 * stopping the 8-bit game work when the editorial skin is shown.
 *
 * The editorial layout is the SSR default; the 8-bit layout is mounted when the
 * visitor opts into it via the switch (cookie `ui=pixel`).
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
        document.documentElement.dataset.ui === "pixel"
          ? "pixel"
          : "editorial",
      );
    window.addEventListener("uichange", read);
    return () => window.removeEventListener("uichange", read);
  }, []);

  return <>{mode === "editorial" ? editorial : pixel}</>;
}
