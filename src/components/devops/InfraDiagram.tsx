"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  DEFAULT_NODE,
  FRAME_LABEL,
  OUTSIDE_LABEL,
  TYPE,
  VIEWBOX,
  edges,
  nodes,
  routes,
} from "@/data/infra";
import type { InfraEdge, InfraNode } from "@/data/types";
import { roundedPath, wrapSegments } from "@/lib/diagram";
import { currentLevel, LEVEL_EVENT } from "@/motion/level";
import { mountTraffic, type RouteId, type Traffic } from "@/motion/traffic";
import { PauseToggle } from "@/components/ui/PauseToggle";

export type NodeText = {
  label: string;
  labelShort?: string;
  sub: string[];
  detail: string;
  facts: string[];
};

export type DiagramText = {
  title: string;
  desc: string;
  outside: string;
  hint: string;
  onDemand: string;
  production: string;
  vps: { label: string; sub: string[] };
  docker: string[];
  edgeLabels: Record<string, string[]>;
  nodes: Record<string, NodeText>;
};

type Orientation = "land" | "port";

/** Rutas que se pueden disparar a mano desde los botones del pie (v3). */
const SEND_ROUTES: RouteId[] = ["web", "bot", "deploy"];


/** Nodos y aristas que se encienden al resaltar `id`. */
function hotSet(id: string | null) {
  if (!id) return null;
  const bus = ["caddy", "wordpress", "appsmonitor", "n8n"];
  const e = new Set<string>();
  const n = new Set<string>([id]);
  for (const edge of edges) {
    const touches =
      edge.from === id || edge.to === id || (edge.to === "bus" && bus.includes(id));
    if (!touches) continue;
    e.add(edge.id);
    if (edge.to === "bus") {
      n.add("caddy");
      continue;
    }
    n.add(edge.from);
    n.add(edge.to);
  }
  return { nodes: n, edges: e };
}

function NodeShape({
  node,
  o,
  text,
  hot,
  selected,
  onHover,
  onSelect,
  onTab,
}: {
  node: InfraNode;
  o: Orientation;
  text: NodeText;
  hot: boolean;
  selected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string, scroll?: boolean, kbd?: boolean) => void;
  /** Tab desde el nodo; true = ya lo manejó (la hoja móvil va «después» de su nodo). */
  onTab?: (id: string) => boolean;
}) {
  const b = node[o];
  // LED de estado (v3): parpadea cuando le llega un paquete.
  const led = { cx: b.x + b.w - 10, cy: b.y + 10 };
  const ty = TYPE[o];
  const budget = Math.floor((b.w - 24) / ty.charW);
  const lines = wrapSegments(text.sub, budget);
  const label = o === "port" && text.labelShort ? text.labelShort : text.label;
  const isStrip = node.kind === "strip";

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(node.id, true, true);
    } else if (e.key === "Tab" && !e.shiftKey && onTab?.(node.id)) e.preventDefault();
  };

  // Subetiquetas de escena (v2, re-QA): a 17 u, solo las que entran enteras en
  // la caja, y solo visibles en el nodo encendido de su paso. Nunca se parte ni
  // se recorta una línea: se muestran menos segmentos.
  const SCENE = 17;
  const sceneBudget = Math.floor((b.w - 24) / (SCENE * 0.6));
  const sceneMax = Math.max(0, Math.min(4, Math.floor((b.h - 34) / 20)));
  // Tantos segmentos ENTEROS como quepan: nunca se muestra media frase.
  let sceneLines: string[] = [];
  if (o === "land" && !isStrip) {
    for (let k = 1; k <= text.sub.length; k++) {
      const next = wrapSegments(text.sub.slice(0, k), sceneBudget);
      if (next.length > sceneMax) break;
      sceneLines = next;
    }
  }

  // La franja del host no lleva etiqueta visible: solo sus datos.
  const firstY = isStrip
    ? o === "land"
      ? b.y + b.h / 2 + ty.sub * 0.35
      : b.y + ty.labelY
    : b.y + ty.subY;

  return (
    <g
      className={`node node--${node.kind}${hot ? " is-hot" : ""}`}
      role="button"
      tabIndex={0}
      // Sin aria-label: el nombre es el texto visible (título + subetiquetas), así
      // siempre lo contiene entero (label-content-name-mismatch, re-QA).
      aria-pressed={selected}
      aria-controls="infra-detail"
      data-node={node.id}
      data-group={node.group}
      onPointerEnter={() => onHover(node.id)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => {
        onHover(node.id);
        onSelect(node.id);
      }}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(node.id, true)}
      onKeyDown={onKey}
    >
      {/* Halo de foco: relleno --accent-dim de 4 u, no glow (DISENO-v2 §11 #8). */}
      <rect className="node__halo" x={b.x - 4} y={b.y - 4} width={b.w + 8} height={b.h + 8} rx={7} />
      <rect className="node__ring" x={b.x - 3} y={b.y - 3} width={b.w + 6} height={b.h + 6} rx={6} />
      <rect className="node__box" x={b.x} y={b.y} width={b.w} height={b.h} rx={4} />
      {!isStrip && <circle className="node__led" cx={led.cx} cy={led.cy} r={3} />}
      {!isStrip && (
        <text className="t-label" x={b.x + 12} y={b.y + ty.labelY} fontSize={ty.label}>
          {label}
        </text>
      )}
      {/* En la escena las subetiquetas se ocultan: la franja muestra su nombre. */}
      {isStrip && o === "land" && (
        <text className="t-label t-strip-label" x={b.x + 12} y={b.y + b.h / 2 + ty.label * 0.35} fontSize={ty.label}>
          {text.label}
        </text>
      )}
      {lines.map((line, i) => (
        <text
          key={i}
          className="t-sub"
          x={b.x + 12}
          y={firstY + i * ty.step}
          fontSize={ty.sub}
        >
          {line}
        </text>
      ))}
      {sceneLines.map((line, i) => (
        <text
          key={`s${i}`}
          className="t-sub t-sub--scene"
          x={b.x + 12}
          y={b.y + 48 + i * 20}
          fontSize={SCENE}
          aria-hidden
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function Diagram({
  o,
  text,
  hot,
  selected,
  svgRef,
  onHover,
  onSelect,
  onTab,
}: {
  o: Orientation;
  text: DiagramText;
  hot: string | null;
  selected: string;
  svgRef: RefObject<SVGSVGElement | null>;
  onHover: (id: string | null) => void;
  onSelect: (id: string, scroll?: boolean, kbd?: boolean) => void;
  onTab?: (id: string) => boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const vb = VIEWBOX[o];
  const ty = TYPE[o];
  const set = hotSet(hot);
  const vps = nodes.find((n) => n.id === "vps")![o];
  const docker = nodes.find((n) => n.id === "docker")![o];
  const vpsL = FRAME_LABEL.vps[o];
  const dkL = FRAME_LABEL.docker[o];
  const out = OUTSIDE_LABEL[o];

  const edgeLabel = (edge: InfraEdge) => {
    const pos = o === "land" ? edge.labelLand : edge.labelPort;
    const lines = text.edgeLabels[edge.id];
    if (!pos || !lines) return null;
    const rows = o === "land" && !edge.labelLand?.lines ? [lines.join(" ")] : lines;
    return (
      <text
        key={`${edge.id}-l`}
        className={`edge-label t-caption${set?.edges.has(edge.id) ? " is-hot" : ""}`}
        fontSize={ty.edge}
        textAnchor={pos.anchor}
        data-edge-label={edge.id}
      >
        {rows.map((r, i) => (
          <tspan key={i} x={pos.x} y={pos.y + i * (ty.edge + 4)}>
            {r}
          </tspan>
        ))}
      </text>
    );
  };

  // Las aristas punteadas no se pueden «dibujar» con su propio dasharray: se
  // dibujan con una máscara (DISENO-v2 §6.3). Por eso NO llevan pathLength=1
  // (escalaría su «5 4» a la ruta entera y quedarían lisas); la máscara sí.
  const dashed = edges.filter((e) => e.type !== "traffic");

  return (
    <svg
      ref={svgRef}
      className={`dg infra__svg infra__svg--${o}`}
      viewBox={`0 0 ${vb.w} ${vb.h}`}
      role="group"
      aria-labelledby={`${uid}-t ${uid}-d`}
      data-hot={set ? "" : undefined}
      data-orientation={o}
    >
      <title id={`${uid}-t`}>{text.title}</title>
      <desc id={`${uid}-d`}>{text.desc}</desc>
      <defs>
        <marker id={`${uid}-a`} viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" markerUnits="userSpaceOnUse" orient="auto">
          <path className="arrow" d="M0 0 L6 3 L0 6 Z" />
        </marker>
        <marker id={`${uid}-ah`} viewBox="0 0 6 6" refX="6" refY="3" markerWidth="6" markerHeight="6" markerUnits="userSpaceOnUse" orient="auto">
          <path className="arrow arrow--hot" d="M0 0 L6 3 L0 6 Z" />
        </marker>
        {dashed.map((edge) => (
          // userSpaceOnUse: con objectBoundingBox una arista recta (alto 0) quedaba sin región.
          <mask
            key={edge.id}
            id={`${uid}-m-${edge.id}`}
            maskUnits="userSpaceOnUse"
            x={-8}
            y={-8}
            width={vb.w + 16}
            height={vb.h + 16}
          >
            <path
              d={roundedPath(edge[o])}
              pathLength={1}
              fill="none"
              stroke="#fff"
              strokeWidth={6}
              strokeDasharray="1 1"
              data-edge-mask={edge.id}
            />
          </mask>
        ))}
      </defs>

      {/* Fronteras */}
      <rect className="frame-vps" data-frame="vps" pathLength={1} x={vps.x} y={vps.y} width={vps.w} height={vps.h} rx={8} />
      <g data-frame-label="vps">
        <text className="t-frame" x={vpsL.x} y={vpsL.y} fontSize={ty.label}>
          {text.vps.label}
        </text>
        {(o === "land" ? [text.vps.sub.join(" · ")] : text.vps.sub).map((line, i) => (
          <text
            key={line}
            className="t-frame-sub"
            x={vpsL.x}
            y={vpsL.y + (o === "land" ? 20 : 20 + i * 18)}
            fontSize={ty.sub}
          >
            {line}
          </text>
        ))}
      </g>
      <rect className="frame-docker" data-frame="docker" pathLength={1} x={docker.x} y={docker.y} width={docker.w} height={docker.h} rx={6} />
      <g data-frame-label="docker">
        {(o === "land" ? [text.docker.join(" · ")] : text.docker).map((line, i) => (
          <text key={line} className="t-caption" x={dkL.x} y={dkL.y + i * 18} fontSize={ty.frame}>
            {line}
          </text>
        ))}
      </g>
      <text className="t-caption" x={out.x} y={out.y} fontSize={ty.frame} data-frame-label="outside">
        {text.outside}
      </text>

      {/* Aristas */}
      {edges.map((edge) => {
        const isHot = !!set?.edges.has(edge.id);
        const isTraffic = edge.type === "traffic";
        return (
          <path
            key={edge.id}
            className={`edge edge--${edge.type}${isHot ? " is-hot" : ""}`}
            d={roundedPath(edge[o])}
            pathLength={isTraffic ? 1 : undefined}
            mask={isTraffic ? undefined : `url(#${uid}-m-${edge.id})`}
            markerEnd={edge.to === "bus" ? undefined : `url(#${uid}-${isHot ? "ah" : "a"})`}
            data-edge={edge.id}
          />
        );
      })}
      {edges.map(edgeLabel)}

      {/* Recorridos (pasan por debajo de los nodos) */}
      {routes.map((r) => (
        <path
          key={r.id}
          className={`trace trace--${r.id}`}
          d={roundedPath(r[o])}
          pathLength={1}
          data-route={r.id}
          aria-hidden
        />
      ))}

      {/* Tráfico vivo (v3): lo puebla src/motion/traffic.ts. Encima de las
          aristas y debajo de los nodos, que lo tapan al cruzarlos. */}
      <g className="packets" aria-hidden="true" />

      {/* Nodos */}
      {/* Orden de foco = orden visual. En la vertical el orden de los datos
          saltaba (dns → github, abajo de todo → host → caddy, arriba) y un Tab
          movía la página más de una pantalla (QA v3). */}
      {nodes
        .filter((n) => n.interactive)
        .sort((a, b) => (o === "port" ? a.port.y - b.port.y || a.port.x - b.port.x : 0))
        .map((n) => (
          <NodeShape
            key={n.id}
            node={n}
            o={o}
            text={text.nodes[n.id]}
            hot={!!set?.nodes.has(n.id)}
            selected={selected === n.id}
            onHover={onHover}
            onSelect={onSelect}
            onTab={onTab}
          />
        ))}
    </svg>
  );
}

/**
 * Bloque DevOps (v3): título, diagrama (dos composiciones), panel de detalle,
 * envío de tráfico y pie (CI + leyenda), en flujo normal: sin escena fija.
 * El estado de resaltado y de selección vive aquí; el tráfico lo mueve
 * src/motion/traffic.ts en el bucle compartido.
 */
export function InfraStage({
  text,
  panelLabels,
  title,
  steps,
  foot,
  traffic,
}: {
  text: DiagramText;
  panelLabels: { facts: string; kind: Record<string, string> };
  title: ReactNode;
  steps: ReactNode;
  foot: ReactNode;
  traffic: { label: string; routes: Record<string, string>; pause: string; play: string; close: string };
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const landRef = useRef<SVGSVGElement>(null);
  const portRef = useRef<SVGSVGElement>(null);
  const flows = useRef<Traffic[]>([]);
  const [hot, setHot] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>(DEFAULT_NODE);
  // Hoja inferior no modal (móvil): el detalle aparece sin sacar el nodo de
  // vista, así se ve el tráfico que se acaba de enviar (QA v3).
  const [sheet, setSheet] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  /** Nodo que abrió la hoja (el «origen»): su detalle es lo que muestra. */
  const lastNode = useRef<SVGGElement | null>(null);
  const originId = useRef<string | null>(null);
  /** Abrir con teclado mueve el foco a la hoja UNA vez, en la apertura. */
  const focusOnOpen = useRef(false);

  /** Cierra la hoja y, si el foco estaba en ella (o se pide), vuelve al nodo de origen. */
  const closeSheet = (returnFocus: boolean) => {
    const inside = !!sheetRef.current?.contains(document.activeElement);
    setSheet(false);
    originId.current = null;
    if (returnFocus || inside) lastNode.current?.focus({ preventScroll: true });
  };

  /**
   * Orden de foco con la hoja abierta (vive en un portal al final de <body>,
   * pero se recorre como si estuviera justo después de su nodo):
   *   nodo de origen → (Tab) X → (Tab) lo siguiente al nodo en el documento.
   *   Mayús+Tab desde la X o desde la hoja → nodo de origen.
   * Ningún ciclo: llegar con Tab a otro nodo cierra la hoja (ver select).
   */
  const focusables = () =>
    Array.from(
      document.querySelectorAll<HTMLElement | SVGElement>(
        'a[href], button:not([disabled]), input:not([type="hidden"]), textarea, select, summary, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !sheetRef.current?.contains(el) && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden");

  const onNodeTab = (id: string) => {
    if (!sheet || originId.current !== id) return false;
    const close = sheetRef.current?.querySelector<HTMLElement>(".infra-sheet__close");
    if (!close) return false;
    close.focus({ preventScroll: true });
    return true;
  };

  /** Una sola columna con el diagrama vertical: el panel queda lejos, debajo. */
  const stacked = () => {
    const body = stageRef.current?.querySelector<HTMLElement>(".stage-body");
    return !!body && getComputedStyle(body).gridTemplateColumns.trim().split(/\s+/).length === 1 && !!portRef.current?.getClientRects().length;
  };

  // Tras un clic o Enter, se trae el panel a la vista lo mínimo
  // (block:"nearest", con scroll-margin bajo el header); con reduce, sin
  // animar. Si es sticky (900–1250 px) ya acompaña al diagrama: no se mueve.
  const revealPanel = () => {
    const panel = stageRef.current?.querySelector<HTMLElement>(".infra__panel");
    if (!panel || getComputedStyle(panel).position === "sticky") return;
    requestAnimationFrame(() => {
      const r = panel.getBoundingClientRect();
      const vis = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0));
      if (vis >= r.height * 0.8) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panel.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    });
  };

  /** `scroll` = acción explícita (clic, Enter, Espacio): además envía tráfico. */
  const select = (id: string, scroll?: boolean, kbd?: boolean) => {
    setSelected(id);
    if (!scroll) {
      // Foco (Tab) sobre OTRO nodo: la hoja era del de origen, se retira sin
      // tocar el foco. Nunca se abre ni roba foco por enfocar un nodo.
      if (sheet && originId.current !== id) closeSheet(false);
      return;
    }
    flows.current.forEach((f) => f.send(id));
    if (stacked()) {
      lastNode.current = portRef.current?.querySelector<SVGGElement>(`[data-node="${id}"]`) ?? null;
      originId.current = id;
      if (sheet) {
        // Ya abierta (Enter en otro nodo): el efecto de apertura no se repite.
        if (kbd) sheetRef.current?.focus({ preventScroll: true });
      } else {
        focusOnOpen.current = !!kbd;
        setSheet(true);
      }
    } else revealPanel();
  };

  // Con la hoja abierta: si tapa el nodo tocado, la página sube lo justo; se
  // cierra con Esc o cuando el diagrama sale de la vista.
  useEffect(() => {
    if (!sheet) return;
    const el = sheetRef.current;
    const nodeEl = lastNode.current;
    if (el && nodeEl) {
      const nr = nodeEl.getBoundingClientRect();
      const limit = el.getBoundingClientRect().top - 12;
      if (nr.bottom > limit) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollBy({ top: nr.bottom - limit, behavior: reduce ? "auto" : "smooth" });
      }
    }
    // Abierta con teclado: el foco pasa a la hoja (se lee su contenido), solo
    // en esta transición de apertura. Con un toque se queda en el nodo.
    if (focusOnOpen.current) el?.focus({ preventScroll: true });
    focusOnOpen.current = false;
    const svgWrap = stageRef.current?.querySelector(".stage-svg");
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) closeSheet(false);
    });
    if (svgWrap) io.observe(svgWrap);
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") closeSheet(true);
      // Simétrico de Tab: desde lo que sigue al nodo de origen, Mayús+Tab
      // pasa por la X antes de volver al nodo.
      if (e.key === "Tab" && e.shiftKey && lastNode.current) {
        const list = focusables();
        const i = list.indexOf(lastNode.current);
        const close = sheetRef.current?.querySelector<HTMLElement>(".infra-sheet__close");
        if (i >= 0 && close && document.activeElement === list[i + 1]) {
          e.preventDefault();
          close.focus({ preventScroll: true });
        }
      }
    };
    // El diagrama vertical mide ~1800 px: si la persona sigue leyendo (media
    // pantalla de scroll desde donde se abrió), la hoja se retira sola.
    let y0: number | null = null;
    const t = window.setTimeout(() => (y0 = window.scrollY), 700);
    const onScroll = () => {
      if (y0 !== null && Math.abs(window.scrollY - y0) > window.innerHeight * 0.5) closeSheet(false);
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [sheet]);

  // La hoja vive al final de <body> (portal: dentro del .shell, con contención
  // de layout, position:fixed no sería relativa a la ventana). Para el orden de
  // foco se comporta como si estuviera junto al nodo: Tab o Mayús+Tab al salir
  // de ella devuelven el foco al nodo que la abrió, y de ahí sigue el flujo.
  const onSheetKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !lastNode.current) return;
    const close = sheetRef.current?.querySelector<HTMLElement>(".infra-sheet__close");
    const at = document.activeElement;
    if (e.shiftKey && (at === close || at === sheetRef.current)) {
      e.preventDefault();
      lastNode.current.focus({ preventScroll: true });
    } else if (!e.shiftKey && at === close) {
      e.preventDefault();
      const list = focusables();
      const next = list[list.indexOf(lastNode.current) + 1];
      // Lo siguiente al nodo de origen (otro nodo cierra la hoja al enfocarse).
      if (next) next.focus();
      else closeSheet(true);
    }
  };

  const sendRoute = (r: RouteId) => flows.current.forEach((f) => f.sendRoute(r));

  // Tráfico: una instancia por composición (solo corre la que se ve). Se monta
  // y desmonta con el nivel de motion; con reduce no hay paquetes.
  useEffect(() => {
    const section = stageRef.current?.closest<HTMLElement>("section");
    const paused = () => !!section?.hasAttribute("data-paused");
    const sync = () => {
      flows.current.forEach((f) => f.destroy());
      flows.current = [];
      if (currentLevel() === "none") return;
      if (landRef.current) flows.current.push(mountTraffic(landRef.current, "land", paused));
      if (portRef.current) flows.current.push(mountTraffic(portRef.current, "port", paused));
    };
    sync();
    window.addEventListener(LEVEL_EVENT, sync);
    return () => {
      window.removeEventListener(LEVEL_EVENT, sync);
      flows.current.forEach((f) => f.destroy());
      flows.current = [];
    };
  }, []);

  const node = text.nodes[selected];
  const kind = nodes.find((n) => n.id === selected)?.kind;

  return (
    <div className="devops-stage" ref={stageRef}>
      {title}
      <div className="stage-body">
        <div className="stage-diagram">
          <div className="stage-svg">
            {(["land", "port"] as const).map((o) => (
              <div key={o} className={`dg-wrap dg-wrap--${o}`}>
                <Diagram
                  o={o}
                  text={text}
                  hot={hot}
                  selected={selected}
                  svgRef={o === "land" ? landRef : portRef}
                  onHover={setHot}
                  onSelect={select}
                  onTab={onNodeTab}
                />
              </div>
            ))}
          </div>
          {steps}
        </div>
        <aside id="infra-detail" className="infra__panel" aria-live="polite">
          <div className="infra__panel-inner" key={selected}>
            <div>
              <h3 className="t-h3">
                <span>{node.label}</span>
                {kind && panelLabels.kind[kind] && (
                  <span className="tag tag--demo t-small">{panelLabels.kind[kind]}</span>
                )}
              </h3>
              <p className="t-small infra__hint">{text.hint}</p>
            </div>
            <p className="ink-2">{node.detail}</p>
            <div>
              <p className="t-small ink-3">{panelLabels.facts}</p>
              <ul className="infra__facts t-data">
                {node.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
      {/* Envío de tráfico + pausa del tráfico continuo (WCAG 2.2.2). Solo con motion. */}
      <div className="stage-traffic" role="group" aria-labelledby="stage-traffic-label">
        <p id="stage-traffic-label" className="t-small ink-3">
          {traffic.label}
        </p>
        <div className="stage-traffic__btns">
          {SEND_ROUTES.map((r) => (
            <button key={r} type="button" className={`send-btn send-btn--${r}`} onClick={() => sendRoute(r)}>
              <i aria-hidden />
              {traffic.routes[r]}
            </button>
          ))}
          <PauseToggle target=".devops" pauseLabel={traffic.pause} playLabel={traffic.play} />
        </div>
      </div>
      {foot}
      {sheet &&
        createPortal(
          // No modal y sin aria-live: el panel (aria-live) ya anuncia el cambio.
          <div className="infra-sheet" ref={sheetRef} role="region" aria-label={node.label} tabIndex={-1} onKeyDown={onSheetKey}>
            <div className="infra-sheet__head">
              <p className="t-h3">{node.label}</p>
              <button type="button" className="infra-sheet__close" aria-label={traffic.close} onClick={() => closeSheet(true)}>
                <X size={18} strokeWidth={1.5} aria-hidden />
              </button>
            </div>
            <p className="t-small ink-2">{node.detail}</p>
            <ul className="infra__facts t-data">
              {node.facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
