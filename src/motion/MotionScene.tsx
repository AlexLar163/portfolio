"use client";

import { useEffect } from "react";
import { currentLevel, LEVEL_EVENT } from "./level";
import { afterLoad, gsapReady, type Kit } from "./load";

export type SceneName = "devops" | "clients" | "featured" | "chrome";

type Mount = (root: HTMLElement, kit: Kit) => () => void;

const SCENES: Record<SceneName, () => Promise<{ mount: Mount }>> = {
  devops: () => import("./scenes/devops"),
  clients: () => import("./scenes/clients"),
  featured: () => import("./scenes/featured"),
  chrome: () => import("./scenes/chrome"),
};

/** Sección que monta cada escena (chrome = la página entera). */
const ROOT: Record<SceneName, () => HTMLElement | null> = {
  devops: () => document.getElementById("devops"),
  clients: () => document.getElementById("clientes"),
  featured: () => document.getElementById("proyectos"),
  chrome: () => document.body,
};

/**
 * Punto de montaje de una escena GSAP (DISENO-v2 §7.5). Renderiza null. Solo con
 * `.motion-ok`: al acercarse la sección (150 % de margen) pide GSAP y la escena, y
 * llama a `mount`. El cleanup revierte todo (estilos inline y ScrollTriggers) al
 * desmontar, al cambiar de idioma o al perder `.motion-ok`.
 */
export function MotionScene({ name }: { name: SceneName }) {
  useEffect(() => {
    let off: (() => void) | undefined;
    let io: IntersectionObserver | undefined;
    let alive = true;
    let token = 0;

    const teardown = () => {
      token++;
      io?.disconnect();
      io = undefined;
      off?.();
      off = undefined;
    };

    const arm = () => {
      const root = ROOT[name]();
      if (!root) return;
      const my = ++token;
      // Precarga en reposo tras `load`: el chunk ya está cuando la sección se acerca
      // y el montaje no suma la evaluación de GSAP a su frame (re-QA, long task).
      afterLoad().then(() => {
        const idle = (cb: () => void) => {
          if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(cb, { timeout: 2000 });
          else setTimeout(cb, 200);
        };
        idle(() => {
          if (my !== token) return;
          gsapReady().catch(() => {});
          SCENES[name]().catch(() => {});
        });
      });
      const start = async () => {
        io?.disconnect();
        try {
          await afterLoad();
          const [kit, mod] = await Promise.all([gsapReady(), SCENES[name]()]);
          if (!alive || my !== token || currentLevel() !== "ok") return;
          off = mod.mount(root, kit);
        } catch {
          /* sin GSAP: la página queda en su estado final (MotionRoot baja el nivel) */
        }
      };
      io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) start();
        },
        { rootMargin: "150% 0px" },
      );
      io.observe(root);
    };

    const sync = () => {
      teardown();
      if (currentLevel() === "ok") arm();
    };
    sync();
    window.addEventListener(LEVEL_EVENT, sync);
    return () => {
      alive = false;
      window.removeEventListener(LEVEL_EVENT, sync);
      teardown();
    };
  }, [name]);
  return null;
}
