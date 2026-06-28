"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { sound } from "@/lib/sound";
import { MiniGame } from "./MiniGame";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];
const HUES = [-30, 30, 80, 130, 180, 220, 270, 310];
const PHASES = ["day", "dusk", "night", "dusk"] as const;
const COLORS = [
  "#ff5a6e",
  "#ffd166",
  "#5bd0a0",
  "#5cc8ff",
  "#ff8ad8",
  "#c0392b",
  "#2e7d32",
];
const CLOUDS = [
  { top: 70, w: 36, dur: 36, delay: 0 },
  { top: 190, w: 26, dur: 48, delay: -14 },
  { top: 330, w: 42, dur: 40, delay: -24 },
  { top: 500, w: 30, dur: 54, delay: -8 },
  { top: 660, w: 38, dur: 44, delay: -32 },
];
const BUSHES = [
  { x: 4, s: 1 },
  { x: 19, s: 0.78 },
  { x: 33, s: 1.12 },
  { x: 48, s: 0.7 },
  { x: 62, s: 1 },
  { x: 76, s: 0.85 },
  { x: 90, s: 1.05 },
];

interface Dog {
  id: number;
  hue: number;
  bottom: number;
  dur: number;
  delay: number;
}
interface Coin {
  id: number;
  top: number;
  left: number;
  collected: boolean;
}
interface Fall {
  id: number;
  left: number;
  color: string;
  dur: number;
  dx: number;
}
interface Spark {
  id: number;
  x: number;
  y: number;
  color: string;
  fx: number;
  fy: number;
  dur: number;
  delay: number;
}

const rand = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export function ArcadeLayer() {
  const t = useTranslations("arcade");
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [confetti, setConfetti] = useState<Fall[]>([]);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [collected, setCollected] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const progress = useRef(0);
  const uid = useRef(0);
  const lastKonami = useRef(0);

  useEffect(() => {
    setCollected(Number(window.localStorage.getItem("coins") || 0));
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3400);
  }, []);

  // ---------- effects ----------
  const spawnDogs = useCallback((n: number) => {
    const pack: Dog[] = Array.from({ length: n }, (_, i) => ({
      id: ++uid.current,
      hue: rand(HUES),
      bottom: 2 + Math.random() * 34,
      dur: 5 + Math.random() * 3,
      delay: i * 0.28 + Math.random() * 0.2,
    }));
    setDogs((d) => [...d, ...pack]);
    pack.forEach((dog) =>
      window.setTimeout(
        () => setDogs((list) => list.filter((x) => x.id !== dog.id)),
        (dog.delay + dog.dur) * 1000 + 800,
      ),
    );
  }, []);

  const confettiBurst = useCallback((count: number) => {
    const pieces: Fall[] = Array.from({ length: count }, () => ({
      id: ++uid.current,
      left: Math.random() * 100,
      color: rand(COLORS),
      dur: 1.6 + Math.random() * 1.6,
      dx: Math.random() * 220 - 110,
    }));
    setConfetti((c) => [...c, ...pieces]);
    pieces.forEach((p) =>
      window.setTimeout(
        () => setConfetti((c) => c.filter((x) => x.id !== p.id)),
        (p.dur + 0.4) * 1000,
      ),
    );
  }, []);

  const fireworks = useCallback((bursts = 3) => {
    const all: Spark[] = [];
    for (let b = 0; b < bursts; b++) {
      const cx = 15 + Math.random() * 70;
      const cy = 18 + Math.random() * 42;
      const color = rand(COLORS);
      for (let i = 0; i < 22; i++) {
        const ang = (i / 22) * Math.PI * 2;
        const dist = 60 + Math.random() * 70;
        all.push({
          id: ++uid.current,
          x: cx,
          y: cy,
          color,
          fx: Math.cos(ang) * dist,
          fy: Math.sin(ang) * dist,
          dur: 0.8 + Math.random() * 0.5,
          delay: b * 0.25,
        });
      }
    }
    setSparks((s) => [...s, ...all]);
    all.forEach((p) =>
      window.setTimeout(
        () => setSparks((s) => s.filter((x) => x.id !== p.id)),
        (p.delay + p.dur) * 1000 + 400,
      ),
    );
  }, []);

  // Full Konami celebration: pack of dogs + confetti + fireworks +
  // a coin reward + a fanfare + a centred achievement banner.
  // Rate-limited to once every 20s, and lighter when the user prefers
  // reduced motion (keeps the page snappy on low-end devices).
  const releaseDogs = useCallback(() => {
    const now = Date.now();
    const remaining = Math.ceil((20_000 - (now - lastKonami.current)) / 1000);
    if (remaining > 0) {
      showToast(t("cooldown", { s: remaining }));
      sound.error();
      return;
    }
    lastKonami.current = now;

    setCollected((n) => {
      const next = n + 25;
      window.localStorage.setItem("coins", String(next));
      return next;
    });
    sound.fanfare();
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 3600);

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // banner + reward only — no heavy particles

    spawnDogs(20);
    confettiBurst(150);
    fireworks(10);
    window.setTimeout(() => fireworks(8), 1200);
  }, [spawnDogs, confettiBurst, fireworks, showToast, t]);

  // ---------- coins ----------
  const collect = useCallback((id: number) => {
    setCoins((c) =>
      c.map((coin) => (coin.id === id ? { ...coin, collected: true } : coin)),
    );
    setCollected((n) => {
      const next = n + 1;
      window.localStorage.setItem("coins", String(next));
      return next;
    });
    sound.coin();
    window.setTimeout(
      () => setCoins((c) => c.filter((coin) => coin.id !== id)),
      320,
    );
  }, []);

  const buy = useCallback(
    (cost: number, fn: () => void) => {
      if (collected < cost) {
        showToast(t("noCoins"));
        return;
      }
      const next = collected - cost;
      setCollected(next);
      window.localStorage.setItem("coins", String(next));
      fn();
      sound.coin();
      showToast(t("spent"));
    },
    [collected, showToast, t],
  );

  // ---------- konami ----------
  const pushKey = useCallback(
    (key: string) => {
      if (key === KONAMI[progress.current]) {
        progress.current += 1;
        if (progress.current === KONAMI.length) {
          progress.current = 0;
          releaseDogs();
        }
      } else {
        progress.current = key === KONAMI[0] ? 1 : 0;
      }
    },
    [releaseDogs],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pushKey(k);
    };
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      // "fiuuu" when jumping to a section from the header nav
      if (el.closest(".hud nav a")) {
        sound.swoosh();
      } else if (
        el.closest(".pixel-btn, .icon-btn, .chan a, .coin-spend, .spend-menu button")
      ) {
        sound.beep(620, 0.05);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [pushKey]);

  // coins spawn over the page
  useEffect(() => {
    const spawn = () => {
      setCoins((c) => {
        if (c.length > 6) return c;
        const docH =
          document.documentElement.scrollHeight || window.innerHeight;
        return [
          ...c,
          {
            id: ++uid.current,
            top: 220 + Math.random() * Math.max(400, docH - 440),
            left: 16 + Math.random() * (window.innerWidth - 70),
            collected: false,
          },
        ];
      });
    };
    const id = window.setInterval(spawn, 5500);
    const first = window.setTimeout(spawn, 1800);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, []);

  // day / night cycle (ping-pong)
  useEffect(() => {
    let i = 0;
    document.body.dataset.phase = "day";
    const id = window.setInterval(() => {
      i = (i + 1) % PHASES.length;
      document.body.dataset.phase = PHASES[i];
    }, 20000);
    return () => window.clearInterval(id);
  }, []);

  const SHOP: { label: string; cost: number; run: () => void }[] = [
    { label: t("sConfetti"), cost: 4, run: () => confettiBurst(60) },
    { label: t("sFireworks"), cost: 7, run: () => fireworks(3) },
    { label: t("sDog"), cost: 3, run: () => spawnDogs(1) },
    {
      label: t("sParty"),
      cost: 12,
      run: () => {
        confettiBurst(90);
        fireworks(4);
        spawnDogs(8);
      },
    },
  ];

  return (
    <>
      {/* ambient clouds */}
      <div className="cloud-layer" aria-hidden="true">
        {CLOUDS.map((c, i) => (
          <span
            key={i}
            className="cloud"
            style={{
              top: c.top,
              width: c.w,
              animationDuration: `${c.dur}s`,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ground bushes */}
      {BUSHES.map((b, i) => (
        <span
          key={i}
          className="bush"
          aria-hidden="true"
          style={{ left: `${b.x}vw`, transform: `scale(${b.s})` }}
        />
      ))}

      <div className="crt" aria-hidden="true" />
      <div className="scan" aria-hidden="true" />

      {/* always-running dog */}
      <div className="dog-run" style={{ "--dur": "7s" } as React.CSSProperties}>
        <span className="puff" />
        <span className="dog" />
      </div>

      {/* dog packs */}
      {dogs.map((d) => (
        <div
          key={d.id}
          className="dog-run once"
          style={
            {
              "--dur": `${d.dur}s`,
              bottom: `${d.bottom}px`,
              animationDelay: `${d.delay}s`,
            } as React.CSSProperties
          }
        >
          <span
            className="dog"
            style={{
              filter: `sepia(.5) saturate(1.6) hue-rotate(${d.hue}deg) brightness(.95)`,
            }}
          />
        </div>
      ))}

      {/* coins */}
      <div className="coin-layer" aria-hidden="true">
        {coins.map((c) => (
          <button
            key={c.id}
            className={`coin-c${c.collected ? " collected" : ""}`}
            style={{ top: c.top, left: c.left }}
            aria-label="coin"
            onClick={() => collect(c.id)}
          />
        ))}
      </div>

      {/* confetti + fireworks */}
      <div className="confetti-layer" aria-hidden="true">
        {confetti.map((p) => (
          <span
            key={p.id}
            className="confetti"
            style={
              {
                left: `${p.left}vw`,
                background: p.color,
                animationDuration: `${p.dur}s`,
                "--dx": `${p.dx}px`,
              } as React.CSSProperties
            }
          />
        ))}
        {sparks.map((p) => (
          <span
            key={p.id}
            className="firework"
            style={
              {
                left: `${p.x}vw`,
                top: `${p.y}vh`,
                background: p.color,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
                "--fx": `${p.fx}px`,
                "--fy": `${p.fy}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* coin counter + spend menu */}
      <div className="coin-hud" aria-live="polite">
        <span className="dot" />
        <span className="coin-label">{t("coins")}:</span> {collected}
        <button
          className="coin-spend"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
        >
          🎉 <span className="spend-label">{t("spend")}</span>
        </button>
        {menuOpen && (
          <div className="spend-menu">
            {SHOP.map((item) => (
              <button
                key={item.label}
                disabled={collected < item.cost}
                onClick={() => buy(item.cost, item.run)}
              >
                {item.label} −{item.cost}
              </button>
            ))}
          </div>
        )}
      </div>

      <MiniGame />

      {/* konami: small floating button that expands the hint + d-pad */}
      {!hintOpen && (
        <button
          className="konami-fab"
          onClick={() => setHintOpen(true)}
          aria-label={t("konamiHint")}
          title={t("konamiHint")}
        >
          👾
        </button>
      )}
      {hintOpen && (
        <div className="konami-hint">
          <button
            className="close"
            onClick={() => setHintOpen(false)}
            aria-label="close"
          >
            ✕
          </button>
          {t("konamiHint")}
          <span className="seq">↑ ↑ ↓ ↓ ← → ← → B A</span>
          <small className="hint-note">{t("cooldownNote")}</small>
          <div className="dpad" aria-label="konami pad">
            <span />
            <button onClick={() => pushKey("ArrowUp")}>↑</button>
            <span />
            <button onClick={() => pushKey("ArrowLeft")}>←</button>
            <button onClick={() => pushKey("ArrowDown")}>↓</button>
            <button onClick={() => pushKey("ArrowRight")}>→</button>
            <div className="ab">
              <button onClick={() => pushKey("b")}>B</button>
              <button onClick={() => pushKey("a")}>A</button>
            </div>
          </div>
        </div>
      )}

      {/* toast */}
      <div className={`arcade-toast${toast ? " show" : ""}`} role="status">
        {toast && <b>{toast}</b>}
      </div>

      {/* konami achievement banner */}
      {celebrate && (
        <div className="konami-banner" role="status" aria-live="assertive">
          <div className="card">
            <div className="trophy">🏆</div>
            <h3>{t("achievement")}</h3>
            <div className="big">{t("konamiTitle")}</div>
            <div className="reward">{t("reward")}</div>
          </div>
        </div>
      )}
    </>
  );
}
