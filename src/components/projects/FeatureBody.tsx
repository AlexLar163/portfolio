"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import type { Status } from "@/data/types";
import { StatusBadge } from "@/components/ui/primitives";
import { useTabs } from "@/components/media/tabs";
import { currentLevel, LEVEL_EVENT } from "@/motion/level";

export type LayerImage = { src: string; w: number; h: number; position?: string; alt: string };

export type FeatureLayer =
  | { kind: "image"; image: LayerImage; inset?: LayerImage }
  | { kind: "video"; poster: LayerImage; video: { mp4?: string; webm?: string } }
  | { kind: "grid"; tiles: LayerImage[] };

export type FeatureStep = { id: string; title: string; body: ReactNode };

const SIZES = "(min-width: 1440px) 780px, (min-width: 900px) 55vw, 100vw";
const SIZES_TILE = "(min-width: 1440px) 390px, (min-width: 900px) 28vw, 50vw";

function Img({ img, sizes, className }: { img: LayerImage; sizes: string; className?: string }) {
  return (
    <Image
      src={img.src}
      alt={img.alt}
      fill
      sizes={sizes}
      className={className}
      style={img.position ? { objectPosition: img.position } : undefined}
    />
  );
}

/**
 * Split de un producto destacado (DISENO-v2 §9): pasos a un lado, media fija al
 * otro. Qué paso está activo lo decide el scroll (IntersectionObserver, en todos
 * los niveles con motion) o, en estático, el tablist de respaldo.
 */
export function FeatureBody({
  name,
  steps,
  layers,
  address,
  status,
  labels,
}: {
  name: string;
  steps: FeatureStep[];
  layers: FeatureLayer[];
  address: string;
  status: { status: Status; label: string };
  labels: { play: string; pause: string; tabs: string };
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [inView, setInView] = useState(false);
  const [videoOn, setVideoOn] = useState(false); // src asignado
  const [playing, setPlaying] = useState(false);
  const [auto, setAuto] = useState(false); // hay motion: el video corre solo
  const panelId = useId();

  const activeRef = useRef(0);
  const go = useCallback((i: number) => {
    if (i === activeRef.current) return;
    setDir(i > activeRef.current ? "fwd" : "back");
    activeRef.current = i;
    setActive(i);
  }, []);
  const tabs = useTabs(steps.length, active, go);

  // Paso activo por scroll: el `li` que cruza la franja central (45–55 %).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let io: IntersectionObserver | undefined;
    const sync = () => {
      io?.disconnect();
      io = undefined;
      const level = currentLevel();
      setAuto(level !== "none");
      if (level === "none") return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(".feature__steps > li"));
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) go(Number((e.target as HTMLElement).dataset.step));
          }
        },
        { rootMargin: "-45% 0px -45% 0px" },
      );
      items.forEach((li) => io!.observe(li));
    };
    sync();
    window.addEventListener(LEVEL_EVENT, sync);
    return () => {
      io?.disconnect();
      window.removeEventListener(LEVEL_EVENT, sync);
    };
  }, [go]);

  // El stage en vista (para no reproducir fuera de pantalla).
  useEffect(() => {
    const el = rootRef.current?.querySelector(".feature__stage");
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        // Con motion, la primera vez en vista monta las fuentes (preload="none" hasta entonces).
        if (e.isIntersecting && currentLevel() !== "none") setVideoOn(true);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const current = layers[active];
  const isVideo = current?.kind === "video";

  // Con motion: play al activarse el paso con el stage en vista; pausa al salir.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (auto && isVideo && inView && videoOn) {
      const id = window.setTimeout(() => v.play().catch(() => setPlaying(false)), 0);
      return () => window.clearTimeout(id);
    }
    v.pause();
  }, [auto, isVideo, inView, videoOn]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    setVideoOn(true);
    if (v.paused) window.setTimeout(() => v.play().catch(() => setPlaying(false)), 0);
    else v.pause();
  };

  return (
    <div className="feature__body" ref={rootRef} data-active-step={active}>
      <ol className="feature__steps">
        {steps.map((s, i) => (
          <li key={s.id} data-step={i} data-current={i === active ? "" : undefined}>
            <div className="feature-step">
              <h4 className="feature-step__title">{s.title}</h4>
              {s.body}
            </div>
          </li>
        ))}
      </ol>

      <div className="feature__stage">
        <div className="frame feature__frame">
          <div className="frame__bar">
            <span className="frame__addr t-data-sm">{address}</span>
            <StatusBadge status={status.status} label={status.label} />
          </div>
          <div className="feature__media" id={panelId} role="tabpanel" aria-label={steps[active]?.title}>
            {layers.map((l, i) => {
              const state = i === active ? "on" : i < active ? "before" : "after";
              return (
                <div
                  key={i}
                  className={`layer layer--${l.kind}`}
                  data-state={state}
                  data-dir={dir}
                  aria-hidden={i !== active}
                >
                  {l.kind === "image" && (
                    <>
                      <Img img={l.image} sizes={SIZES} className="layer__img" />
                      {l.inset && (
                        <div className="layer__phone">
                          <Image src={l.inset.src} alt={l.inset.alt} width={l.inset.w} height={l.inset.h} sizes="200px" />
                        </div>
                      )}
                    </>
                  )}
                  {l.kind === "video" && (
                    <>
                      <Img img={l.poster} sizes={SIZES} className="layer__img" />
                      <video
                        ref={videoRef}
                        className="layer__video"
                        data-visible={playing && i === active}
                        muted
                        playsInline
                        loop
                        preload="none"
                        aria-hidden
                        tabIndex={-1}
                        onPlaying={() => setPlaying(true)}
                        onPause={() => setPlaying(false)}
                      >
                        {videoOn && l.video.webm && <source src={l.video.webm} type="video/webm" />}
                        {videoOn && l.video.mp4 && <source src={l.video.mp4} type="video/mp4" />}
                      </video>
                    </>
                  )}
                  {l.kind === "grid" && (
                    <div className="layer__grid">
                      {l.tiles.map((tile) => (
                        <div key={tile.src} className="layer__tile">
                          <Img img={tile} sizes={SIZES_TILE} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {isVideo && !auto && (
              <button
                type="button"
                className="play-btn play-btn--always"
                onClick={toggle}
                aria-label={(playing ? labels.pause : labels.play).replace("{name}", name)}
                aria-pressed={playing}
              >
                {playing ? <Pause size={20} strokeWidth={1.5} aria-hidden /> : <Play size={20} strokeWidth={1.5} aria-hidden />}
              </button>
            )}
          </div>
          <div className="feature__progress" aria-hidden>
            {steps.map((s, i) => (
              <span key={s.id} data-seg={i} data-filled={i <= active ? "" : undefined}>
                <i />
              </span>
            ))}
          </div>
        </div>
        <div className="segment feature__tabs" aria-label={labels.tabs} {...tabs.list}>
          {steps.map((s, i) => (
            <button key={s.id} {...tabs.tab(i, panelId)}>
              {s.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
