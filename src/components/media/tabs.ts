"use client";

import { useEffect, useLayoutEffect, useRef, type KeyboardEvent } from "react";

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Pestañas con flechas del teclado (roving tabindex, patrón WAI-ARIA Tabs con
 * activación automática). Devuelve props para el tablist y para cada pestaña.
 *
 * El tablist recibe --ix/--iw con la posición de la pestaña activa: el CSS dibuja
 * UN indicador que se desliza (DISENO-v2 §11 #5). Con flechas, `data-kbd` hace
 * que salte sin transición: no se anima una acción de teclado.
 */
export function useTabs(count: number, active: number, onChange: (i: number) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const listRef = useRef<HTMLElement | null>(null);
  const kbd = useRef(false);

  useIso(() => {
    const list = listRef.current;
    if (!list) return;
    const place = () => {
      const tab = refs.current[active];
      if (!tab) return;
      list.style.setProperty("--ix", `${tab.offsetLeft}px`);
      list.style.setProperty("--iw", String(tab.offsetWidth));
    };
    list.toggleAttribute("data-kbd", kbd.current);
    kbd.current = false;
    place();
    const ro = new ResizeObserver(place);
    ro.observe(list);
    return () => ro.disconnect();
  }, [active]);

  const onKeyDown = (e: KeyboardEvent) => {
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (active + 1) % count;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (active - 1 + count) % count;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    if (next < 0) return;
    e.preventDefault();
    kbd.current = true;
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

  return {
    list: {
      role: "tablist" as const,
      onKeyDown,
      "data-indicator": "",
      ref: (el: HTMLElement | null) => {
        listRef.current = el;
      },
    },
    tab,
  };
}
