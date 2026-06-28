"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { sound } from "@/lib/sound";

const GROUND = 28;
const DOG_W = 46;
const DOG_LEFT = 44;
const OBS_W = 20;
const HEIGHTS = [26, 34, 44, 30];

// Pickable dog colours (hue-rotate over the base sprite).
const DOGS = [
  { id: "brown", hue: -16, label: "🐕" },
  { id: "grey", hue: 0, label: "🐺", extra: "saturate(.2)" },
  { id: "pink", hue: 120, label: "🐩" },
  { id: "blue", hue: 200, label: "🦊" },
  { id: "green", hue: 90, label: "🐉" },
];

interface Obstacle {
  el: HTMLDivElement;
  x: number;
  w: number;
  passed: boolean;
}

export function MiniGame() {
  const t = useTranslations("arcade");
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [dogId, setDogId] = useState("brown");

  const stageRef = useRef<HTMLDivElement>(null);
  const obsLayer = useRef<HTMLDivElement>(null);
  const dogRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);
  const st = useRef({
    y: 0,
    vy: 0,
    jumping: false,
    holding: false,
    holdTime: 0,
    speed: 4.5,
    score: 0,
    spawnIn: 60,
    obs: [] as Obstacle[],
  });

  // restore best + chosen dog
  useEffect(() => {
    setBest(Number(window.localStorage.getItem("mg-best") || 0));
    const d = window.localStorage.getItem("mg-dog");
    if (d) setDogId(d);
  }, []);

  const dog = DOGS.find((d) => d.id === dogId) ?? DOGS[0];

  const clearObstacles = () => {
    st.current.obs.forEach((o) => o.el.remove());
    st.current.obs = [];
  };

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setRunning(false);
  }, []);

  const spawn = useCallback(() => {
    const layer = obsLayer.current;
    if (!layer) return;
    const h = HEIGHTS[Math.floor(Math.random() * HEIGHTS.length)];
    const el = document.createElement("div");
    el.className = "mg-obstacle";
    el.style.height = `${h}px`;
    const stageW = stageRef.current?.clientWidth ?? 600;
    el.style.left = `${stageW + 10}px`;
    layer.appendChild(el);
    st.current.obs.push({ el, x: stageW + 10, w: OBS_W, passed: false });
  }, []);

  const loop = useCallback(() => {
    const s = st.current;
    s.speed = 4.5 + s.score * 0.22;

    // variable jump physics
    if (s.jumping) {
      const floaty = s.holding && s.holdTime < 16 && s.vy > 0;
      if (floaty) s.holdTime += 1;
      const g = floaty ? 0.32 : 0.9;
      s.vy -= g;
      s.y += s.vy;
      if (s.y <= 0) {
        s.y = 0;
        s.vy = 0;
        s.jumping = false;
      }
    }
    if (dogRef.current)
      dogRef.current.style.transform = `translateY(${-s.y}px)`;

    // obstacles
    s.spawnIn -= 1;
    if (s.spawnIn <= 0) {
      spawn();
      s.spawnIn = Math.max(38, 95 - s.score * 1.5) + Math.random() * 40;
    }
    const dogRight = DOG_LEFT + DOG_W - 12;
    for (let i = s.obs.length - 1; i >= 0; i--) {
      const o = s.obs[i];
      o.x -= s.speed;
      o.el.style.left = `${o.x}px`;
      const h = o.el.offsetHeight;

      // collision
      if (
        o.x < dogRight &&
        o.x + o.w > DOG_LEFT + 10 &&
        s.y < h - 6
      ) {
        setOver(true);
        setScore(s.score);
        setBest((b) => {
          const nb = Math.max(b, s.score);
          window.localStorage.setItem("mg-best", String(nb));
          return nb;
        });
        sound.beep(150, 0.3, "sawtooth");
        clearObstacles();
        stop();
        return;
      }

      // scored
      if (!o.passed && o.x + o.w < DOG_LEFT) {
        o.passed = true;
        s.score += 1;
        setScore(s.score);
        sound.beep(880, 0.04);
      }
      // recycle
      if (o.x < -o.w) {
        o.el.remove();
        s.obs.splice(i, 1);
      }
    }

    raf.current = requestAnimationFrame(loop);
  }, [spawn, stop]);

  const start = useCallback(() => {
    clearObstacles();
    st.current = {
      y: 0,
      vy: 0,
      jumping: false,
      holding: false,
      holdTime: 0,
      speed: 4.5,
      score: 0,
      spawnIn: 40,
      obs: [],
    };
    setScore(0);
    setOver(false);
    setRunning(true);
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(loop);
  }, [loop]);

  const jumpDown = useCallback(() => {
    const s = st.current;
    if (!running) {
      start();
      return;
    }
    if (!s.jumping) {
      s.jumping = true;
      s.holding = true;
      s.holdTime = 0;
      s.vy = 9.5;
      sound.jump();
    }
  }, [running, start]);

  const jumpUp = useCallback(() => {
    st.current.holding = false;
  }, []);

  // keyboard controls while open
  useEffect(() => {
    if (!open) return;
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jumpDown();
      }
      if (e.code === "Escape") setOpen(false);
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") jumpUp();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [open, jumpDown, jumpUp]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const dogFilter = `sepia(.5) saturate(1.6) hue-rotate(${dog.hue}deg) brightness(.95)${
    dog.extra ? ` ${dog.extra}` : ""
  }`;

  return (
    <>
      <button
        className="pixel-btn go mg-launch"
        onClick={() => {
          setOpen(true);
          sound.powerUp();
        }}
      >
        🕹 {t("play")}
      </button>

      {open && (
        <div
          className="mg-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              stop();
              setOpen(false);
            }
          }}
        >
          <div className="mg-box">
            <div className="mg-head">
              <span>🐕 MINI-GAME</span>
              <span>
                {t("score")}: {score} · {t("best")}: {best}
              </span>
              <button
                className="icon-btn"
                onClick={() => {
                  stop();
                  setOpen(false);
                }}
              >
                ✕
              </button>
            </div>

            <div className="mg-dogpick">
              {DOGS.map((d) => (
                <button
                  key={d.id}
                  className={`mg-swatch${d.id === dogId ? " on" : ""}`}
                  title={d.id}
                  onClick={() => {
                    setDogId(d.id);
                    window.localStorage.setItem("mg-dog", d.id);
                    sound.beep(700, 0.05);
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div
              className="mg-stage"
              ref={stageRef}
              onPointerDown={jumpDown}
              onPointerUp={jumpUp}
            >
              <div className="mg-cloud c1" />
              <div className="mg-cloud c2" />
              <div className="mg-obstacles" ref={obsLayer} />
              <div
                className="mg-dog"
                ref={dogRef}
                style={{ bottom: GROUND, filter: dogFilter }}
              />
              <div className="mg-ground" />
              {!running && (
                <div className="mg-start">
                  {over ? t("gameOver") : "▶"}
                  <small>{t("minigame")}</small>
                </div>
              )}
            </div>

            <p className="mg-msg">
              {over
                ? `${t("gameOver")} — ${t("score")}: ${score}`
                : t("minigame")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
