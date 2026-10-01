"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { wake } from "@/motion/engine";

/**
 * Pausa de lo que se mueve solo más de 5 s (WCAG 2.2.2): `prefers-reduced-motion`
 * no alcanza, mucha gente no sabe que existe. Marca `data-paused` en el ancestro
 * `target` (selector) y el CSS congela sus animaciones.
 */
export function PauseToggle({
  target,
  pauseLabel,
  playLabel,
}: {
  target: string;
  pauseLabel: string;
  playLabel: string;
}) {
  const [paused, setPaused] = useState(false);
  return (
    <button
      type="button"
      className="pause-btn t-small"
      aria-pressed={paused}
      onClick={(e) => {
        const next = !paused;
        setPaused(next);
        e.currentTarget.closest(target)?.toggleAttribute("data-paused", next);
        // El bucle compartido duerme en pausa: al reanudar hay que despertarlo.
        wake();
      }}
    >
      {paused ? <Play size={14} strokeWidth={1.5} aria-hidden /> : <Pause size={14} strokeWidth={1.5} aria-hidden />}
      {paused ? playLabel : pauseLabel}
    </button>
  );
}
