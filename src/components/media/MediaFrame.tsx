"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { Status } from "@/data/types";
import { StatusBadge } from "@/components/ui/primitives";

export type FrameImage = {
  src: string;
  w: number;
  h: number;
  fit: "cover" | "contain";
  position?: string;
  alt: string;
};

export type FrameVideo = { mp4?: string; webm?: string };

export type FrameSlide = {
  id: string;
  image?: FrameImage;
  video?: FrameVideo;
  inset?: FrameImage;
};

export type FrameProps = {
  slides: FrameSlide[];
  active?: number;
  /** Monta las diapositivas no activas (tras la primera interacción) para el fundido. */
  warm?: boolean;
  name: string;
  address: string;
  status?: { status: Status; label: string };
  sizes: string;
  placeholder: string;
  labels: { play: string; pause: string };
  priority?: boolean;
  onWarm?: () => void;
};

const HOVER_DELAY = 150;

function prefersHoverPlay() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function MediaFrame({
  slides,
  active = 0,
  warm = false,
  name,
  address,
  status,
  sizes,
  placeholder,
  labels,
  priority,
  onWarm,
}: FrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [loaded, setLoaded] = useState(false); // src asignado (primer hover/foco/toque)
  const [playing, setPlaying] = useState(false);
  const current = slides[active] ?? slides[0];
  const video = current?.video;

  // Al montar las fuentes o cambiar de diapositiva: se detiene (el evento pause
  // oculta el video) y se recarga con las fuentes nuevas. Layout effect: tiene que
  // correr antes del play() que agenda el clic o el hover.
  useLayoutEffect(() => {
    const v = videoRef.current;
    if (!v || !loaded) return;
    v.pause();
    v.load();
  }, [active, loaded]);

  // Todo video que sale de la vista se pausa.
  useEffect(() => {
    const el = frameRef.current;
    if (!el || !video) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) videoRef.current?.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [video]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => setPlaying(false));
  };

  const onEnter = () => {
    onWarm?.();
    if (!video || !prefersHoverPlay()) return;
    setLoaded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(play, HOVER_DELAY);
  };

  const onLeave = () => {
    window.clearTimeout(timer.current);
    if (!video || !prefersHoverPlay()) return;
    videoRef.current?.pause();
  };

  const toggle = () => {
    setLoaded(true);
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      // El <source> recién montado necesita un tick para existir.
      window.setTimeout(play, 0);
    } else {
      v.pause();
    }
  };

  return (
    <div
      ref={frameRef}
      className="frame"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onWarm}
    >
      <div className="frame__bar">
        <span className="frame__addr t-data-sm">{address}</span>
        {status && <StatusBadge status={status.status} label={status.label} />}
      </div>
      <div className="frame__media">
        {slides.map((s, i) => {
          const isActive = i === active;
          if (!isActive && !warm) return null;
          return (
            <div key={s.id} className="frame__slide" data-active={isActive} aria-hidden={!isActive}>
              {s.image ? (
                <Image
                  src={s.image.src}
                  alt={isActive ? s.image.alt : ""}
                  fill
                  sizes={sizes}
                  priority={priority && i === 0}
                  className={`frame__img${s.image.fit === "contain" ? " frame__img--contain" : ""}`}
                  style={s.image.position ? { objectPosition: s.image.position } : undefined}
                />
              ) : (
                <div className="frame__placeholder t-data">{placeholder}</div>
              )}
              {s.inset && (
                <div className="frame__inset">
                  <Image
                    src={s.inset.src}
                    alt={isActive ? s.inset.alt : ""}
                    width={s.inset.w}
                    height={s.inset.h}
                    sizes="180px"
                  />
                </div>
              )}
            </div>
          );
        })}
        {video && (
          <>
            <video
              ref={videoRef}
              className="frame__video"
              data-visible={playing}
              muted
              playsInline
              loop
              preload="none"
              aria-hidden
              tabIndex={-1}
              onPlaying={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            >
              {loaded && video.webm && <source src={video.webm} type="video/webm" />}
              {loaded && video.mp4 && <source src={video.mp4} type="video/mp4" />}
            </video>
            <button
              type="button"
              className="play-btn"
              onClick={toggle}
              aria-label={(playing ? labels.pause : labels.play).replace("{name}", name)}
              aria-pressed={playing}
            >
              {playing ? (
                <Pause size={20} strokeWidth={1.5} aria-hidden />
              ) : (
                <Play size={20} strokeWidth={1.5} aria-hidden />
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
