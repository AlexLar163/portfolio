"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { demoUrl, isUp, type DemoId } from "@/data/status";
import { afterLoadIdle, ensureStatus, onStatus } from "@/motion/live";
import { StatusBadge, TextLink } from "@/components/ui/primitives";
import { DemoRequestLink } from "./DemoRequestLink";

export type DemoCtaText = {
  /** Rótulo del estado «en vivo» (status.live). */
  live: string;
  /** Rótulo del estado «bajo pedido» (status.on-demand). */
  onDemand: string;
  viewLive: string;
  /** «Demo en vivo bajo pedido» (solo en la tarjeta). */
  onDemandNote: string;
  requestDemo: string;
  /** Mensaje que se precarga en el formulario de contacto. */
  prefill: string;
  newTab: string;
};

/**
 * CTA de una demo del taller, resuelto con el estado real (/api/status, ISR de
 * 5 min; la petición es compartida, ver src/motion/live.ts).
 *
 *   responde (2xx/3xx) → «En vivo · Ver en vivo», enlace real
 *   502, TLS, caído    → «Bajo pedido · Pedirla» (#contacto con el mensaje)
 *
 * El HTML estático (y sin JS, y mientras mide) es «bajo pedido» y NO trae el
 * enlace: un sitio que responde 502 nunca queda enlazado. Los dos estados viven
 * apilados en la misma celda y se alterna la visibilidad: la caja mide lo que
 * el más grande desde el primer render, así que resolver no mueve nada (CLS 0).
 * El oculto va con visibility:hidden: fuera del orden de tabulación y del árbol
 * de accesibilidad.
 */
export function DemoLiveCta({
  id,
  variant,
  text,
}: {
  id: DemoId;
  variant: "card" | "row";
  text: DemoCtaText;
}) {
  const [up, setUp] = useState(false);

  useEffect(() => {
    const off = onStatus((p) => setUp(isUp(p.sites.find((s) => s.id === id))));
    const cancel = afterLoadIdle(ensureStatus);
    return () => {
      off();
      cancel();
    };
  }, [id]);

  const linkClass = variant === "row" ? "t-small" : "";
  const request = <DemoRequestLink label={text.requestDemo} message={text.prefill} />;

  return (
    <span className={`avail avail--${variant}`} data-avail={up ? "live" : "on-demand"}>
      <span className="avail__state" data-on={up ? undefined : ""}>
        <StatusBadge status="on-demand" label={text.onDemand} />
        {variant === "card" ? (
          <span className="on-demand t-small">
            {text.onDemandNote}
            {request}
          </span>
        ) : (
          request
        )}
      </span>
      <span className="avail__state" data-on={up ? "" : undefined}>
        <StatusBadge status="live" label={text.live} />
        {up ? (
          <TextLink href={demoUrl(id)} external newTabLabel={text.newTab} className={linkClass}>
            {text.viewLive}
          </TextLink>
        ) : (
          // Mismo texto y misma caja que el enlace, sin destino: reserva el lugar.
          <span className={`link ${linkClass}`}>
            {text.viewLive}
            <ArrowUpRight className="link__icon" strokeWidth={1.5} aria-hidden />
          </span>
        )}
      </span>
    </span>
  );
}
