"use client";

import { useEffect } from "react";
import { computeLevel, LEVEL_EVENT, REDUCE_QUERY } from "./level";
import { mountObserve } from "./lite/observe";
import { mountCircuit } from "./circuit";

/**
 * Mantiene la clase de nivel en <html> (el script inline ya la puso antes del
 * primer paint), monta el circuito y el motion liviano, y avisa a los
 * componentes cuando cambia la preferencia. Renderiza null.
 */
export function MotionRoot() {
  useEffect(() => {
    const html = document.documentElement;
    let offObserve: (() => void) | undefined;
    let offCircuit: (() => void) | undefined;

    const apply = () => {
      const lite = computeLevel() !== "none";
      const changed = html.classList.contains("motion-lite") !== lite;
      html.classList.add("js");
      html.classList.toggle("motion-lite", lite);
      offCircuit?.();
      offCircuit = mountCircuit(lite);
      if (lite && !offObserve) offObserve = mountObserve();
      if (!lite && offObserve) {
        offObserve();
        offObserve = undefined;
      }
      if (changed) window.dispatchEvent(new CustomEvent(LEVEL_EVENT, { detail: lite ? "lite" : "none" }));
    };
    apply();
    const mq = window.matchMedia(REDUCE_QUERY);
    mq.addEventListener("change", apply);

    // Pestaña oculta: lo que corre en CSS (marquee) se pausa; el bucle rAF ya
    // se duerme solo (engine.ts).
    const onVis = () => html.classList.toggle("is-hidden", document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mq.removeEventListener("change", apply);
      document.removeEventListener("visibilitychange", onVis);
      offObserve?.();
      offCircuit?.();
    };
  }, []);
  return null;
}
