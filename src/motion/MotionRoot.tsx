"use client";

import { useEffect } from "react";
import { computeLevel, LEVEL_EVENT, MOTION_OK_QUERY, REDUCE_QUERY } from "./level";
import { mountObserve } from "./lite/observe";

/**
 * Mantiene las clases de nivel en <html> (el script inline ya las puso antes del
 * primer paint) y avisa a las escenas cuando cambian. Renderiza null.
 */
export function MotionRoot() {
  useEffect(() => {
    const html = document.documentElement;
    let offObserve: (() => void) | undefined;
    const apply = () => {
      const level = computeLevel();
      const lite = level !== "none";
      const ok = level === "ok";
      const changed =
        html.classList.contains("motion-lite") !== lite || html.classList.contains("motion-ok") !== ok;
      html.classList.add("js");
      html.classList.toggle("motion-lite", lite);
      html.classList.toggle("motion-ok", ok);
      // Motion liviano (observers, marquee, spotlight): con cualquier nivel salvo «ninguno».
      if (lite && !offObserve) offObserve = mountObserve();
      if (!lite && offObserve) {
        offObserve();
        offObserve = undefined;
      }
      if (changed) window.dispatchEvent(new CustomEvent(LEVEL_EVENT, { detail: level }));
    };
    apply();
    const mqs = [window.matchMedia(MOTION_OK_QUERY), window.matchMedia(REDUCE_QUERY)];
    mqs.forEach((m) => m.addEventListener("change", apply));

    // Pestaña oculta: todo lo que corre en bucle (paquetes, marquee) se pausa.
    const onVis = () => html.classList.toggle("is-hidden", document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mqs.forEach((m) => m.removeEventListener("change", apply));
      document.removeEventListener("visibilitychange", onVis);
      offObserve?.();
    };
  }, []);
  return null;
}
