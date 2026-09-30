"use client";

import { useEffect } from "react";
import {
  computeLevel,
  GSAP_FAILED_EVENT,
  LEVEL_EVENT,
  MOTION_OK_QUERY,
  REDUCE_QUERY,
  SCENE_SIZE_QUERY,
} from "./level";
import { mountObserve } from "./lite/observe";

/**
 * Posición relativa dentro de la sección que ocupa el tope de la ventana. Al
 * cambiar de nivel las escenas cambian de alto (4,2 pantallas ↔ auto) y sin esto
 * el scroll saltaba ~2400 px (QA).
 */
function captureAnchor() {
  const secs = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
  const probe = window.innerHeight * 0.3;
  for (const el of secs) {
    const r = el.getBoundingClientRect();
    if (r.top <= probe && r.bottom > probe) return { el, frac: (probe - r.top) / r.height };
  }
  return null;
}

function restoreAnchor(a: ReturnType<typeof captureAnchor>) {
  if (!a) return;
  const r = a.el.getBoundingClientRect();
  const y = window.scrollY + r.top + a.frac * r.height - window.innerHeight * 0.3;
  window.scrollTo({ top: y, behavior: "instant" });
}

/**
 * Mantiene las clases de nivel en <html> (el script inline ya las puso antes del
 * primer paint) y avisa a las escenas cuando cambian. Renderiza null.
 */
export function MotionRoot() {
  useEffect(() => {
    const html = document.documentElement;
    let offObserve: (() => void) | undefined;
    let last = captureAnchor();
    const onScrollEnd = () => {
      last = captureAnchor();
    };
    window.addEventListener("scrollend", onScrollEnd, { passive: true });
    const apply = () => {
      const level = computeLevel();
      const lite = level !== "none";
      const ok = level === "ok";
      const scene = ok && window.matchMedia(SCENE_SIZE_QUERY).matches;
      const changed =
        html.classList.contains("motion-lite") !== lite ||
        html.classList.contains("motion-ok") !== ok ||
        html.classList.contains("scene-devops") !== scene;
      // El ancla se toma al terminar cada scroll: cuando llega el evento de
      // matchMedia el ancho ya cambió y las secciones ya tienen otro alto.
      const anchor = changed ? last : null;
      html.classList.add("js");
      html.classList.toggle("motion-lite", lite);
      html.classList.toggle("motion-ok", ok);
      html.classList.toggle("scene-devops", scene);
      // Motion liviano (observers, marquee, spotlight): con cualquier nivel salvo «ninguno».
      if (lite && !offObserve) offObserve = mountObserve();
      if (!lite && offObserve) {
        offObserve();
        offObserve = undefined;
      }
      if (changed) {
        window.dispatchEvent(new CustomEvent(LEVEL_EVENT, { detail: level }));
        restoreAnchor(anchor);
        // Las escenas se montan/desmontan después: se vuelve a fijar tras su refresh.
        // (el refresh de ScrollTrigger tras el resize llega con ~200 ms de debounce).
        window.setTimeout(() => restoreAnchor(anchor), 400);
        window.setTimeout(() => {
          restoreAnchor(anchor);
          last = captureAnchor();
        }, 900);
      }
    };
    apply();
    const mqs = [MOTION_OK_QUERY, REDUCE_QUERY, SCENE_SIZE_QUERY].map((q) => window.matchMedia(q));
    mqs.forEach((m) => m.addEventListener("change", apply));
    window.addEventListener(GSAP_FAILED_EVENT, apply);

    // Pestaña oculta: todo lo que corre en bucle (paquetes, marquee) se pausa.
    const onVis = () => html.classList.toggle("is-hidden", document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mqs.forEach((m) => m.removeEventListener("change", apply));
      window.removeEventListener(GSAP_FAILED_EVENT, apply);
      window.removeEventListener("scrollend", onScrollEnd);
      document.removeEventListener("visibilitychange", onVis);
      offObserve?.();
    };
  }, []);
  return null;
}
