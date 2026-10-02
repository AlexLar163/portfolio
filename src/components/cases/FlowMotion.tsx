"use client";

import { useEffect, useRef } from "react";
import { currentLevel, LEVEL_EVENT } from "@/motion/level";
import { mountFlow } from "@/motion/flow";

/** Paquete del diagrama de flujo: se monta y desmonta con el nivel de motion (reduce = estático). */
export function FlowMotion() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let off: (() => void) | undefined;
    const sync = () => {
      off?.();
      off = undefined;
      const root = ref.current?.closest<HTMLElement>(".flow");
      if (root && currentLevel() !== "none") off = mountFlow(root);
    };
    sync();
    window.addEventListener(LEVEL_EVENT, sync);
    return () => {
      window.removeEventListener(LEVEL_EVENT, sync);
      off?.();
    };
  }, []);
  return <span ref={ref} className="flow__pk" aria-hidden="true" />;
}
