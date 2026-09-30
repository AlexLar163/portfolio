"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  DEFAULT_NODE,
  FRAME_LABEL,
  OUTSIDE_LABEL,
  TYPE,
  VIEWBOX,
  STEP_NODES,
  edges,
  nodes,
  routes,
} from "@/data/infra";
import type { InfraEdge, InfraNode } from "@/data/types";
import { roundedPath, wrapSegments } from "@/lib/diagram";
import { mountCaptions } from "@/motion/lite/captions";
import { currentLevel, LEVEL_EVENT } from "@/motion/level";

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
const TRACE_TOTAL = 1400 + 300; // --dur-trace + desfase del recorrido 2

/**
 * Paquetes de tráfico vivo (DISENO-v2 §6.2). Nunca más de 5 a la vez.
 * Cada uno es una punta + una estela sobre un clon del `d` de su ruta.
 */
const PACKETS: { of: string; d: number; delays: number[]; scheduled?: boolean }[] = [
  { of: "route-1", d: 2.4, delays: [0, 1.3] },
  { of: "route-2", d: 3.0, delays: [0.6] },
  { of: "e9", d: 0.9, delays: [1.9] },
  { of: "e12", d: 6.0, delays: [2.0], scheduled: true },
];


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
}: {
  node: InfraNode;
  o: Orientation;
  text: NodeText;
  hot: boolean;
  selected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string, scroll?: boolean) => void;
}) {
  const b = node[o];
  const ty = TYPE[o];
  const budget = Math.floor((b.w - 24) / ty.charW);
  const lines = wrapSegments(text.sub, budget);
  const label = o === "port" && text.labelShort ? text.labelShort : text.label;
  const isStrip = node.kind === "strip";

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(node.id, true);
    }
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
  trace,
  onHover,
  onSelect,
}: {
  o: Orientation;
  text: DiagramText;
  hot: string | null;
  selected: string;
  trace: "idle" | "run" | "done";
  onHover: (id: string | null) => void;
  onSelect: (id: string, scroll?: boolean) => void;
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

  const pathOf = (id: string) => {
    if (id.startsWith("route-")) {
      const r = routes.find((x) => `route-${x.id}` === id)!;
      return roundedPath(r[o]);
    }
    return roundedPath(edges.find((e) => e.id === id)![o]);
  };

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
      className={`dg infra__svg infra__svg--${o}`}
      viewBox={`0 0 ${vb.w} ${vb.h}`}
      role="group"
      aria-labelledby={`${uid}-t ${uid}-d`}
      data-hot={set ? "" : undefined}
      data-trace={trace}
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

      {/* Tráfico vivo: encima de las aristas, debajo de los nodos. */}
      <g className="packets" aria-hidden="true">
        {PACKETS.flatMap((p) =>
          p.delays.map((delay, i) => {
            const d = pathOf(p.of);
            const style = { ["--d" as string]: `${p.d}s`, ["--delay" as string]: `${delay}s` };
            return (
              <g key={`${p.of}-${i}`} className={p.scheduled ? "packet-g packet-g--scheduled" : "packet-g"} data-packet={p.of}>
                <path className="packet-trail" d={d} pathLength={1} style={style} />
                <path className="packet" d={d} pathLength={1} style={style} />
              </g>
            );
          }),
        )}
      </g>

      {/* Nodos */}
      {nodes
        .filter((n) => n.interactive)
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
          />
        ))}
    </svg>
  );
}

/** Centinelas del caption móvil: cada uno cubre desde su nodo hasta el siguiente. */
function Sentinels({ stepIds }: { stepIds: string[] }) {
  const H = VIEWBOX.port.h;
  const ys = stepIds
    .map((id, i) => ({ i, y: nodes.find((n) => n.id === STEP_NODES[id])?.port.y ?? 0 }))
    .sort((a, b) => a.y - b.y);
  return (
    <div className="stage-sentinels" aria-hidden="true">
      {ys.map((s, k) => {
        const end = k + 1 < ys.length ? ys[k + 1].y : H;
        return (
          <span
            key={s.i}
            data-sentinel={s.i}
            style={{ top: `${(s.y / H) * 100}%`, height: `${((end - s.y) / H) * 100}%` }}
          />
        );
      })}
    </div>
  );
}

/**
 * Escena DevOps completa (DISENO-v2 §5): título, diagrama (dos composiciones),
 * pasos, panel de detalle y pie (CI + leyenda). El estado de resaltado y de
 * selección vive aquí; la escena GSAP solo lee el DOM y escribe estilos.
 */
export function InfraStage({
  text,
  panelLabels,
  title,
  steps,
  stepIds,
  foot,
}: {
  text: DiagramText;
  panelLabels: { facts: string; kind: Record<string, string> };
  title: ReactNode;
  steps: ReactNode;
  stepIds: string[];
  foot: ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>(DEFAULT_NODE);
  const [trace, setTrace] = useState<"idle" | "run" | "done">("idle");
  const picked = useRef(false);
  const select = (id: string, scroll?: boolean) => {
    picked.current = true;
    setSelected(id);
    if (scroll) revealPanel();
  };

  // Diagrama horizontal sin escena: el panel va debajo y el diagrama mide más
  // que la ventana. Tras un clic o Enter, se trae el panel a la vista lo mínimo
  // (block:"nearest"); con reduce, sin animar. En la escena y con el panel al
  // lado (700–1119 px) no hace falta.
  const revealPanel = () => {
    const stage = stageRef.current;
    const panel = stage?.querySelector<HTMLElement>(".infra__panel");
    if (!stage || !panel || stage.classList.contains("is-scene")) return;
    if (getComputedStyle(panel).position === "sticky") return;
    requestAnimationFrame(() => {
      const r = panel.getBoundingClientRect();
      const vis = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0));
      if (vis >= r.height * 0.8) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panel.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
    });
  };

  // Trazo único de v1 al llegar al 40 % visible: solo es el respaldo de la
  // composición horizontal sin escena (el CSS decide si se ve; §5.5.4).
  useEffect(() => {
    const el = stageRef.current?.querySelector<HTMLElement>(".stage-svg");
    if (!el) return;
    let t: number | undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        const rootH = e.rootBounds?.height ?? window.innerHeight;
        if (e.intersectionRatio < 0.4 && e.intersectionRect.height < rootH * 0.5) return;
        io.disconnect();
        if (currentLevel() === "none") {
          setTrace("done");
          return;
        }
        setTrace("run");
        t = window.setTimeout(() => {
          setTrace("done");
          if (!picked.current) setSelected(DEFAULT_NODE);
        }, TRACE_TOTAL);
      },
      { threshold: [0, 0.2, 0.4, 0.6] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  // Caption móvil con centinelas (sin GSAP). Se monta y desmonta con el nivel.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let off: (() => void) | undefined;
    const sync = () => {
      off?.();
      off = currentLevel() === "lite" ? mountCaptions(stage) : undefined;
    };
    sync();
    window.addEventListener(LEVEL_EVENT, sync);
    return () => {
      off?.();
      window.removeEventListener(LEVEL_EVENT, sync);
    };
  }, []);

  const node = text.nodes[selected];
  const kind = nodes.find((n) => n.id === selected)?.kind;

  return (
    <div className="devops-stage" ref={stageRef}>
      {title}
      {/* Diagrama + panel en su propio envoltorio: el panel sticky queda acotado a
          él y nunca pisa el carril de CI ni la leyenda, que van afuera (re-QA). */}
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
                trace={trace}
                onHover={setHot}
                onSelect={select}
              />
              {o === "port" && <Sentinels stepIds={stepIds} />}
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
      {foot}
    </div>
  );
}
