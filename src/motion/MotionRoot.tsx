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
    // El circuito mide todas las secciones (layout forzado): se monta tras
    // `load` y en reposo, nunca compitiendo con el render del lead (LCP).
    let ready = false;
    let idleId: number | undefined;

    const apply = () => {
      const lite = computeLevel() !== "none";
      const changed = html.classList.contains("motion-lite") !== lite;
      html.classList.add("js");
      html.classList.toggle("motion-lite", lite);
      if (ready) {
        offCircuit?.();
        offCircuit = mountCircuit(lite);
      }
      if (lite && !offObserve) offObserve = mountObserve();
      if (!lite && offObserve) {
        offObserve();
        offObserve = undefined;
      }
      if (changed) window.dispatchEvent(new CustomEvent(LEVEL_EVENT, { detail: lite ? "lite" : "none" }));
    };
    apply();
    const start = () => {
      ready = true;
      offCircuit = mountCircuit(computeLevel() !== "none");
    };
    const whenIdle = () => {
      if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(start, { timeout: 1200 });
      else idleId = window.setTimeout(start, 150);
    };
    if (document.readyState === "complete") whenIdle();
    else window.addEventListener("load", whenIdle, { once: true });
    const mq = window.matchMedia(REDUCE_QUERY);
    mq.addEventListener("change", apply);

    // Pestaña oculta: lo que corre en CSS (marquee) se pausa; el bucle rAF ya
    // se duerme solo (engine.ts).
    const onVis = () => html.classList.toggle("is-hidden", document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mq.removeEventListener("change", apply);
      window.removeEventListener("load", whenIdle);
      if (idleId !== undefined) {
        if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
        window.clearTimeout(idleId);
      }
      document.removeEventListener("visibilitychange", onVis);
      offObserve?.();
      offCircuit?.();
    };
  }, []);
  return null;
}
