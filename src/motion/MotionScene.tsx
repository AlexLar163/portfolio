"use client";

export type SceneName = "devops" | "clients" | "featured" | "chrome";

/**
 * Punto de montaje de una escena GSAP (DISENO-v2 §7.5). Renderiza null.
 * Bloque 1: la página queda en su estado final estático; las escenas llegan en el bloque 3.
 */
export function MotionScene({ name }: { name: SceneName }) {
  void name;
  return null;
}
