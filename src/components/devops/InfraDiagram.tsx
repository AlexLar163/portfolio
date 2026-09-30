"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
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
  onSelect: (id: string) => void;
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
      onSelect(node.id);
    }
  };

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
      aria-label={text.label}
      aria-pressed={selected}
      aria-controls="infra-detail"
      data-node={node.id}
      onPointerEnter={() => onHover(node.id)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => {
        onHover(node.id);
        onSelect(node.id);
      }}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(node.id)}
      onKeyDown={onKey}
    >
      <rect className="node__ring" x={b.x - 3} y={b.y - 3} width={b.w + 6} height={b.h + 6} rx={6} />
      <rect className="node__box" x={b.x} y={b.y} width={b.w} height={b.h} rx={4} />
      {!isStrip && (
        <text className="t-label" x={b.x + 12} y={b.y + ty.labelY} fontSize={ty.label}>
          {label}
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
  onSelect: (id: string) => void;
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
    const rows = o === "land" ? [lines.join(" ")] : lines;
    return (
      <text
        key={`${edge.id}-l`}
        className={`edge-label t-caption${set?.edges.has(edge.id) ? " is-hot" : ""}`}
        fontSize={ty.edge}
        textAnchor={pos.anchor}
      >
        {rows.map((r, i) => (
          <tspan key={i} x={pos.x} y={pos.y + i * (ty.edge + 4)}>
            {r}
          </tspan>
        ))}
      </text>
    );
  };

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
      </defs>

      {/* Fronteras */}
      <rect className="frame-vps" x={vps.x} y={vps.y} width={vps.w} height={vps.h} rx={8} />
      <text className="t-frame" x={vpsL.x} y={vpsL.y} fontSize={ty.label}>
        {text.vps.label}
      </text>
      {(o === "land" ? [text.vps.sub.join(" · ")] : text.vps.sub).map((line, i) => (
        <text
          key={line}
          className="t-frame-sub"
          x={o === "land" ? vpsL.x : vpsL.x}
          y={vpsL.y + (o === "land" ? 20 : 20 + i * 18)}
          fontSize={ty.sub}
        >
          {line}
        </text>
      ))}
      <rect className="frame-docker" x={docker.x} y={docker.y} width={docker.w} height={docker.h} rx={6} />
      {(o === "land" ? [text.docker.join(" · ")] : text.docker).map((line, i) => (
        <text key={line} className="t-caption" x={dkL.x} y={dkL.y + i * 18} fontSize={ty.frame}>
          {line}
        </text>
      ))}
      <text className="t-caption" x={out.x} y={out.y} fontSize={ty.frame}>
        {text.outside}
      </text>

      {/* Aristas */}
      {edges.map((edge) => {
        const isHot = !!set?.edges.has(edge.id);
        return (
          <path
            key={edge.id}
            className={`edge edge--${edge.type}${isHot ? " is-hot" : ""}`}
            d={roundedPath(edge[o])}
            markerEnd={edge.to === "bus" ? undefined : `url(#${uid}-${isHot ? "ah" : "a"})`}
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
          aria-hidden
        />
      ))}

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

export function InfraDiagram({
  text,
  panelLabels,
}: {
  text: DiagramText;
  panelLabels: { facts: string; kind: Record<string, string> };
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [hot, setHot] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>(DEFAULT_NODE);
  const [trace, setTrace] = useState<"idle" | "run" | "done">("idle");
  const picked = useRef(false);
  const select = (id: string) => {
    picked.current = true;
    setSelected(id);
  };

  // Trazo único al llegar al 40 % visible (o a media pantalla si el diagrama es
  // más alto que la ventana, como el vertical en móvil).
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let t: number | undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        const rootH = e.rootBounds?.height ?? window.innerHeight;
        if (e.intersectionRatio < 0.4 && e.intersectionRect.height < rootH * 0.5) return;
        io.disconnect();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
          setTrace("done");
          return;
        }
        setTrace("run");
        t = window.setTimeout(() => {
          setTrace("done");
          // Al terminar queda Caddy seleccionado, salvo que la persona ya haya elegido otro.
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

  const node = text.nodes[selected];
  const kind = nodes.find((n) => n.id === selected)?.kind;

  return (
    <div className="infra">
      <div className="infra__stage" ref={stageRef}>
        {(["land", "port"] as const).map((o) => (
          <Diagram
            key={o}
            o={o}
            text={text}
            hot={hot}
            selected={selected}
            trace={trace}
            onHover={setHot}
            onSelect={select}
          />
        ))}
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
  );
}
