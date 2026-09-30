"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowDownRight } from "lucide-react";

type Props = {
  href: string;
  title: string;
  sub: string;
  image?: { src: string; position?: string };
  video?: { mp4?: string; webm?: string };
};

const HOVER_DELAY = 150;

/**
 * Fila del índice de capítulos del hero (DISENO-v2 §4.1). El video del thumb solo
 * se pide con hover de puntero fino (lógica de MediaFrame v1): el LCP sigue siendo texto.
 */
export function ChapterRow({ href, title, sub, image, video }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const canHover = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onEnter = () => {
    if (!video || !canHover()) return;
    setLoaded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      videoRef.current?.play().catch(() => setPlaying(false));
    }, HOVER_DELAY);
  };

  const onLeave = () => {
    window.clearTimeout(timer.current);
    videoRef.current?.pause();
  };

  return (
    <a
      href={href}
      className="chapter spot"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <span className="chapter__thumb" data-overflow-ok>
        {image && (
          <Image
            src={image.src}
            alt=""
            fill
            sizes="(min-width: 900px) 160px, 112px"
            style={image.position ? { objectPosition: image.position } : undefined}
          />
        )}
        {video && (
          <video
            ref={videoRef}
            className="chapter__video"
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
        )}
      </span>
      <span className="chapter__text">
        <span className="chapter__title">{title}</span>
        <span className="chapter__sub t-data">{sub}</span>
      </span>
      <ArrowDownRight className="chapter__arrow" size={20} strokeWidth={1.5} aria-hidden />
    </a>
  );
}
