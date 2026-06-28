/**
 * Tiny retro sound engine (WebAudio). Muted by default — only ever
 * makes noise after the user enables it, so no autoplay surprises.
 */
type Osc = OscillatorType;

class RetroSound {
  enabled = false;
  private ctx: AudioContext | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      // On by default — only off if the user explicitly muted it before.
      this.enabled = window.localStorage.getItem("sfx") !== "0";
    }
  }

  private ensure() {
    if (!this.ctx && typeof window !== "undefined") {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sfx", this.enabled ? "1" : "0");
    }
    if (this.enabled) this.ensure();
    return this.enabled;
  }

  beep(freq = 440, dur = 0.06, type: Osc = "square") {
    if (!this.enabled) return;
    this.ensure();
    if (!this.ctx) return;
    // Browsers start the context suspended until a user gesture.
    if (this.ctx.state === "suspended") void this.ctx.resume();
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = 0.04;
    o.connect(g);
    g.connect(this.ctx.destination);
    const now = this.ctx.currentTime;
    o.start(now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.stop(now + dur);
  }

  coin() {
    this.beep(880, 0.05);
    window.setTimeout(() => this.beep(1320, 0.07), 60);
  }

  // "fiuuu" — a pitch sweep, used when jumping to a section.
  swoosh() {
    if (!this.enabled) return;
    this.ensure();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") void this.ctx.resume();
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "sine";
    const now = this.ctx.currentTime;
    o.frequency.setValueAtTime(1100, now);
    o.frequency.exponentialRampToValueAtTime(320, now + 0.42);
    g.gain.setValueAtTime(0.05, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start(now);
    o.stop(now + 0.5);
  }

  jump() {
    this.beep(520, 0.08, "triangle");
  }

  // Harsh low buzz for an invalid action (e.g. konami during cooldown).
  error() {
    this.beep(200, 0.12, "sawtooth");
    window.setTimeout(() => this.beep(140, 0.2, "sawtooth"), 110);
  }

  powerUp() {
    [440, 660, 880, 1100].forEach((f, i) =>
      window.setTimeout(() => this.beep(f, 0.07), i * 70),
    );
  }

  // Victory jingle for unlocking the Konami achievement.
  fanfare() {
    [523, 659, 784, 1047, 880, 1047, 1319].forEach((f, i) =>
      window.setTimeout(() => this.beep(f, 0.14, "square"), i * 120),
    );
  }
}

export const sound = new RetroSound();
