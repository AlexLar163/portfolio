"use client";

import { useRef, type KeyboardEvent } from "react";

/**
 * Pestañas con flechas del teclado (roving tabindex, patrón WAI-ARIA Tabs con
 * activación automática). Devuelve props para el tablist y para cada pestaña.
 */
export function useTabs(count: number, active: number, onChange: (i: number) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent) => {
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (active + 1) % count;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (active - 1 + count) % count;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(next);
    refs.current[next]?.focus();
  };

  const tab = (i: number, panelId: string) => ({
    ref: (el: HTMLButtonElement | null) => {
      refs.current[i] = el;
    },
    role: "tab" as const,
    type: "button" as const,
    "aria-selected": i === active,
    "aria-controls": panelId,
    tabIndex: i === active ? 0 : -1,
    onClick: () => onChange(i),
  });

  return { list: { role: "tablist" as const, onKeyDown }, tab };
}
