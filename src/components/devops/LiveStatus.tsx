"use client";

import { useEffect, useRef, useState } from "react";
import {
  CircleCheck,
  CircleDashed,
  CircleMinus,
  CirclePower,
  CircleSlash2,
  CircleX,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { demoAvailability, isUp, STATUS_REVALIDATE_S, type SiteResult, type StatusPayload } from "@/data/status";
import { afterLoadIdle, loadStatus } from "@/motion/live";

export type LiveText = {
  title: string;
  lead: string;
  listLabel: string;
  /** «{up} de {total} sitios responden» */
  summary: string;
  pending: string;
  noData: string;
  ageNow: string;
  /** «medido hace {n} min» */
  ageMin: string;
  /** «medido hace {n} h» */
  ageHour: string;
  states: Record<RowState, string>;
  /** Grupo plegado de las demos del taller (on-demand). */
  demos: {
    /** «Demos del taller: {up} encendidos de {total}» */
    summary: string;
    pending: string;
    noData: string;
    listLabel: string;
    note: string;
  };
};

export type LiveSite = { id: string; name: string; host: string };

type RowState = "ok" | "degraded" | "down" | "off" | "unavailable" | "pending" | "nodata";
/** Rótulos apilados de cada grupo: la columna mide lo que el más largo DEL GRUPO. */
const ROW_STATES: RowState[] = ["ok", "degraded", "down", "pending", "nodata"];
/**
 * Demo con 502: apagada (on-demand), no caída. Sin respuesta (TLS, red): no
 * disponible, y no se promete encenderla.
 */
const DEMO_STATES: RowState[] = ["ok", "degraded", "off", "unavailable", "pending", "nodata"];

const ICON: Record<RowState, LucideIcon> = {
  ok: CircleCheck,
  degraded: TriangleAlert,
  down: CircleX,
  off: CirclePower,
  unavailable: CircleSlash2,
  pending: CircleDashed,
  nodata: CircleMinus,
};

const fill = (tpl: string, v: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

/**
 * Bloque «Estado en vivo» (sección DevOps): lee /api/status (ISR de 5 min, ver
 * la ruta) en el cliente, tras `load` y en reposo, así que nunca entra en el
 * camino crítico ni en el LCP. Renueva cada 5 min con la pestaña a la vista.
 * Las filas existen desde el primer render (estado «midiendo»): al llegar los
 * datos cambia solo el texto, no la altura (sin CLS).
 *
 * El resumen es la única región aria-live: anuncia una vez cada medición
 * nueva, no cada minuto que pasa.
 *
 * Las demos del taller van aparte, en un <details> cerrado: una sola fila por
 * defecto («Demos del taller: 7 encendidos de 11») y el detalle al abrir. Una
 * demo que no responde dice «Apagado»: es on-demand, no una falla.
 */
export function LiveStatus({
  text,
  sites,
  demos,
  locale,
}: {
  text: LiveText;
  sites: LiveSite[];
  demos: LiveSite[];
  locale: string;
}) {
  const [data, setData] = useState<StatusPayload | null>(null);
  /** Reloj del servidor − reloj local: «hace X min» no depende de la hora del equipo. */
  const [skew, setSkew] = useState(0);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(0);
  const lastFetch = useRef(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      lastFetch.current = Date.now();
      try {
        // Compartida con el CTA de las demos (src/motion/live.ts): una sola petición.
        const { payload: p, date } = await loadStatus();
        if (!alive) return;
        const server = Date.parse(date ?? "");
        // El encabezado Date viene truncado al segundo: por debajo de 2 s no es desfase, es redondeo.
        const d = Number.isFinite(server) ? server - Date.now() : 0;
        setSkew(Math.abs(d) > 2000 ? d : 0);
        setData(p);
        setFailed(false);
        setNow(Date.now());
      } catch {
        // Si ya había una medición, se conserva (su «hace X min» sigue siendo cierto).
        if (alive) setFailed(true);
      }
    };
    const cancelStart = afterLoadIdle(() => void load());

    const period = STATUS_REVALIDATE_S * 1000;
    const due = () => !document.hidden && lastFetch.current > 0 && Date.now() - lastFetch.current >= period;
    // Se revisa cada minuto (no cada `period`: el primer intervalo vencería
    // antes que la medición inicial, hecha en reposo, y saltaría a 10 min).
    const refresh = window.setInterval(() => due() && load(), 60_000);
    const tick = window.setInterval(() => !document.hidden && setNow(Date.now()), 30_000);
    const onVis = () => {
      if (document.hidden) return;
      setNow(Date.now());
      if (due()) load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      cancelStart();
      window.clearInterval(refresh);
      window.clearInterval(tick);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const nf = new Intl.NumberFormat(locale);
  const byId = new Map<string, SiteResult>((data?.sites ?? []).map((s) => [s.id, s]));
  const noData = !data && failed;

  const rowState = (id: string, demo = false): RowState => {
    if (!data) return noData ? "nodata" : "pending";
    const r = byId.get(id);
    if (!r) return "nodata";
    if (demo && r.state === "down") return demoAvailability(r) === "off" ? "off" : "unavailable";
    return r.state;
  };

  /** Lectura corta (cabe bajo el estado): ms, o el código si el sitio respondió con error. null = sin lectura. */
  const reading = (id: string, st: RowState) => {
    const r = byId.get(id);
    if (st === "pending" || st === "nodata" || st === "off" || st === "unavailable" || !r || r.ms === null) return null;
    return r.code !== null && r.code >= 400 ? `HTTP ${r.code}` : `${nf.format(r.ms)} ms`;
  };

  let summary = text.pending;
  if (noData) summary = text.noData;
  else if (data) {
    const up = sites.filter((s) => {
      const st = byId.get(s.id)?.state;
      return st === "ok" || st === "degraded";
    }).length;
    summary = fill(text.summary, { up, total: sites.length });
  }

  /** Misma regla que el CTA de las tarjetas (isUp): encendida = responde sin error. */
  const demosUp = demos.filter((d) => isUp(byId.get(d.id))).length;
  /** Las tres versiones del resumen de demos, apiladas: el renglón no cambia de ancho al resolver. */
  const demoSummary: [string, string][] = [
    ["pending", text.demos.pending],
    ["nodata", text.demos.noData],
    ["ready", fill(text.demos.summary, { up: demosUp, total: demos.length })],
  ];
  const demoSummaryOn = data ? "ready" : noData ? "nodata" : "pending";

  const row = (s: LiveSite, labels: RowState[], demo = false) => {
    const st = rowState(s.id, demo);
    const value = reading(s.id, st);
    return (
      <li key={s.id} className="live__site" data-state={st}>
        <span className="live__led" aria-hidden />
        <span className="live__name">{s.name}</span>
        <span className="live__host t-data">{s.host}</span>
        {/* Todos los rótulos en la misma celda, visible solo el actual: la
            columna mide lo que el más largo y la fila no cambia de alto
            al pasar de «midiendo» a «vivo» (sin CLS). Los ocultos van con
            visibility:hidden, fuera del árbol de accesibilidad. */}
        <span className="live__state t-small">
          {labels.map((k) => {
            const Icon = ICON[k];
            return (
              <span key={k} className="live__label" data-on={k === st ? "" : undefined}>
                <Icon size={14} strokeWidth={2} aria-hidden />
                {text.states[k]}
              </span>
            );
          })}
        </span>
        <span className="live__ms t-data">{value ?? <span aria-hidden>—</span>}</span>
      </li>
    );
  };

  let age = "";
  if (data?.measuredAt && now) {
    const min = Math.max(0, Math.floor((now + skew - Date.parse(data.measuredAt)) / 60_000));
    age = min < 1 ? text.ageNow : min < 60 ? fill(text.ageMin, { n: min }) : fill(text.ageHour, { n: Math.floor(min / 60) });
  }

  return (
    <section className="live" aria-labelledby="live-title" data-live={data ? "ready" : noData ? "nodata" : "pending"}>
      <header className="live__head">
        <h3 id="live-title" className="subhead live__title">
          <span className="live__beacon" aria-hidden />
          {text.title}
        </h3>
        <p className="t-small ink-2 live__lead">{text.lead}</p>
        <p className="live__meta t-data">
          <span className="live__summary" aria-live="polite">
            {summary}
          </span>
          {/* Línea propia y siempre presente: «midiendo» y «medido» miden igual (sin CLS). */}
          {age && data?.measuredAt ? <time dateTime={data.measuredAt}>{age}</time> : <span aria-hidden>{"\u00a0"}</span>}
        </p>
      </header>
      <ul className="live__list" aria-label={text.listLabel}>
        {sites.map((site) => row(site, ROW_STATES))}
      </ul>
      {demos.length > 0 && (
        <details className="disclosure live__demos">
          <summary>
            <span className="live__demos-sum">
              {demoSummary.map(([k, label]) => (
                <span key={k} className="live__demos-label" data-on={k === demoSummaryOn ? "" : undefined}>
                  {label}
                </span>
              ))}
            </span>
          </summary>
          <div className="disclosure__body">
            <div className="disclosure__inner">
              <p className="t-small ink-3 live__demos-note">{text.demos.note}</p>
              <ul className="live__list" aria-label={text.demos.listLabel}>
                {demos.map((d) => row(d, DEMO_STATES, true))}
              </ul>
            </div>
          </div>
        </details>
      )}
    </section>
  );
}
