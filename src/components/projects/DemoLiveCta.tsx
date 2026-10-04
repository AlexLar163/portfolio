"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { demoAvailability, demoUrl, type DemoAvailability, type DemoId } from "@/data/status";
import { afterLoadIdle, ensureStatus, onStatus } from "@/motion/live";
import { StatusBadge, TextLink } from "@/components/ui/primitives";
import { DemoRequestLink } from "./DemoRequestLink";

export type DemoCtaText = {
  /** Nombre del sitio: va en el nombre accesible de cada enlace. */
  name: string;
  /** Rótulo del estado «en vivo» (status.live). */
  live: string;
  /** Rótulo del estado «bajo pedido» (status.on-demand). */
  onDemand: string;
  /** Rótulo del estado «no disponible» (status.unavailable). */
  unavailable: string;
  viewLive: string;
  /** «Demo en vivo bajo pedido» (solo en la tarjeta). */
  onDemandNote: string;
  requestDemo: string;
  /** Mensaje que se precarga en el formulario de contacto. */
  prefill: string;
  /** «Pedir info»: la demo no responde ni con 502, no se promete encenderla. */
  requestInfo: string;
  infoPrefill: string;
  newTab: string;
};

type Shown = "on-demand" | "live" | "unavailable";

/**
 * CTA de una demo del taller, resuelto con el estado real (/api/status, ISR de
 * 5 min; la petición es compartida, ver src/motion/live.ts).
 *
 *   responde (2xx/3xx)   → «En vivo · Ver en vivo», enlace real
 *   502 (apagada)        → «Bajo pedido · Pedirla» (#contacto con el mensaje)
 *   red / TLS / otro     → «No disponible · Pedir info» (no promete encenderla)
 *
 * El HTML estático (y sin JS, y mientras mide) es «bajo pedido» y NO trae el
 * enlace: un sitio que responde 502 nunca queda enlazado. Los estados viven
 * apilados en la misma celda y se alterna la visibilidad: la caja mide lo que
 * el más grande desde el primer render, así que resolver no mueve nada (CLS 0).
 * Los ocultos van con visibility:hidden: fuera del orden de tabulación y del
 * árbol de accesibilidad.
 */
export function DemoLiveCta({ id, variant, text }: { id: DemoId; variant: "card" | "row"; text: DemoCtaText }) {
  const [avail, setAvail] = useState<DemoAvailability | null>(null);

  useEffect(() => {
    const off = onStatus((p) => setAvail(demoAvailability(p.sites.find((s) => s.id === id))));
    const cancel = afterLoadIdle(ensureStatus);
    return () => {
      off();
      cancel();
    };
  }, [id]);

  const shown: Shown = avail === "up" ? "live" : avail === "unavailable" ? "unavailable" : "on-demand";
  const linkClass = variant === "row" ? "t-small" : "";
  const sr = <span className="sr-only">: {text.name}</span>;

  const state = (k: Shown, children: ReactNode) => (
    <span key={k} className="avail__state" data-on={k === shown ? "" : undefined}>
      {children}
    </span>
  );

  return (
    <span className={`avail avail--${variant}`} data-avail={shown}>
      {state(
        "on-demand",
        <>
          <StatusBadge status="on-demand" label={text.onDemand} />
          {variant === "card" ? (
            <span className="on-demand t-small">
              {text.onDemandNote}
              <DemoRequestLink label={text.requestDemo} message={text.prefill} name={text.name} />
            </span>
          ) : (
            <DemoRequestLink label={text.requestDemo} message={text.prefill} name={text.name} />
          )}
        </>,
      )}
      {state(
        "live",
        <>
          <StatusBadge status="live" label={text.live} />
          {shown === "live" ? (
            // Nombre accesible: «Ver en vivo: IRONPULSE (se abre en otra pestaña)».
            <TextLink href={demoUrl(id)} external newTabLabel={text.newTab} className={linkClass}>
              {text.viewLive}
              {sr}
            </TextLink>
          ) : (
            // Mismo texto y misma caja que el enlace, sin destino: reserva el lugar.
            <span className={`link ${linkClass}`}>
              {text.viewLive}
              <ArrowUpRight className="link__icon" strokeWidth={1.5} aria-hidden />
            </span>
          )}
        </>,
      )}
      {state(
        "unavailable",
        <>
          <StatusBadge status="unavailable" label={text.unavailable} />
          <span className={variant === "card" ? "on-demand t-small" : undefined}>
            <DemoRequestLink label={text.requestInfo} message={text.infoPrefill} name={text.name} />
          </span>
        </>,
      )}
    </span>
  );
}
