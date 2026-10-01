import { addTask, clamp, finePointer, Spring, wake } from "./engine";

/**
 * Lenguaje «Circuito» (v3): una pista continua recorre la página por el margen
 * izquierdo y conecta cada sección. Un paquete de datos la recorre siguiendo
 * al scroll a través de un resorte (suaviza, nunca frena ni retiene el scroll)
 * y enciende los nodos y los titulares al pasar.
 *
 * Además, desde el mismo bucle: spotlight de cursor sobre la retícula de puntos
 * (en táctil sigue al paquete), botones magnéticos, la línea de progreso del
 * header y el llenado del informe de incidente.
 *
 * La pista es una capa absoluta detrás del contenido, `pointer-events:none`,
 * de ancho 100 % del <main>: no ocupa lugar (CLS 0) ni puede crear scroll
 * horizontal. Se recalcula con un ResizeObserver sobre <main>.
 *
 * `animate = false` (reduce, ?motion=0): se dibuja la pista entera encendida y
 * no corre ningún bucle.
 */

const SVG = "http://www.w3.org/2000/svg";
/** Línea de la ventana que «lee» el paquete (fracción del alto). */
const READ_LINE = 0.52;
const TRAIL = 72;

type Pt = [number, number];
/** Nodo de sección (enciende su titular) o ramal de una tarjeta (enciende su pin). */
type RailNode = { sec?: HTMLElement; card?: HTMLElement; len: number; g: SVGGElement };

export function mountCircuit(animate: boolean): () => void {
  const main = document.querySelector<HTMLElement>("main#contenido");
  const layer = main?.querySelector<HTMLElement>(".circuit");
  const svg = layer?.querySelector<SVGSVGElement>("svg");
  if (!main || !layer || !svg) return () => {};
  const html = document.documentElement;
  const pk = layer.querySelector<HTMLElement>(".circuit__pk");
  const [base, lit, trail] = (["c-base", "c-lit", "c-trail"] as const).map((c) => {
    const p = document.createElementNS(SVG, "path");
    p.setAttribute("class", c);
    svg.appendChild(p);
    return p;
  });
  const nodeLayer = document.createElementNS(SVG, "g");
  svg.appendChild(nodeLayer);

  let pts: Pt[] = [];
  let cum: number[] = [];
  let L = 0;
  let mainTop = 0;
  let nodes: RailNode[] = [];
  let lastC = -1;
  // Informe de incidente: posiciones en el documento, medidas en build (nunca
  // dentro del frame: leer rects tras escribir estilos forzaría layout).
  const incident = document.querySelector<HTMLElement>("[data-fill]");
  const incSteps = incident ? Array.from(incident.querySelectorAll<HTMLElement>(":scope > li")) : [];
  let inc = { top: 0, h: 1, steps: [] as number[] };
  const bar = document.querySelector<HTMLElement>(".read-progress");
  const barPk = bar?.querySelector<HTMLElement>("i");
  let barW = 0;

  const lenAtY = (y: number) => {
    if (!pts.length) return 0;
    if (y <= pts[0][1]) return 0;
    let lo = 0;
    let hi = pts.length - 1;
    if (y >= pts[hi][1]) return L;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (pts[mid][1] < y) lo = mid;
      else hi = mid;
    }
    const dy = pts[hi][1] - pts[lo][1];
    const t = dy ? (y - pts[lo][1]) / dy : 0;
    return cum[lo] + t * (cum[hi] - cum[lo]);
  };

  const ptAtLen = (l: number): Pt => {
    if (!pts.length) return [0, 0];
    const d = clamp(l, 0, L);
    let lo = 0;
    let hi = cum.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < d) lo = mid;
      else hi = mid;
    }
    const seg = cum[hi] - cum[lo] || 1;
    const t = (d - cum[lo]) / seg;
    return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * t, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * t];
  };

  const build = () => {
    const mr = main.getBoundingClientRect();
    if (!mr.width) return;
    mainTop = mr.top + window.scrollY;
    const anchors = Array.from(main.querySelectorAll<HTMLElement>("[data-rail]")).filter(
      (el) => el.getClientRects().length,
    );
    if (!anchors.length) return;
    const narrow = mr.width < 760;
    const raw = anchors.map((el) => {
      const shell = el.closest<HTMLElement>(".shell");
      const sr = (shell ?? main).getBoundingClientRect();
      const padL = shell ? parseFloat(getComputedStyle(shell).paddingLeft) || 0 : 0;
      const first = (el.firstElementChild as HTMLElement | null) ?? el;
      const fr = first.getBoundingClientRect();
      const cs = getComputedStyle(first);
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.1;
      return {
        el,
        sec: el.closest<HTMLElement>("section") ?? el,
        x: Math.round(sr.left - mr.left + padL / 2),
        contentX: sr.left - mr.left + padL,
        y: Math.round(fr.top - mr.top + Math.min(fr.height, lh) / 2),
      };
    });

    // Carril en x FIJA: la del shell con menos margen (el ancho de DevOps). Con
    // una x por sección la pista se desviaba de columna en mitad de DevOps y a
    // ≥ 1700 px bajaba por x=216 cruzando el bento y los carriles (QA v3).
    const railX = Math.min(...raw.map((r) => r.x));
    // El LED del header y el nodo del footer (CSS, --rail-x) se corren lo mismo.
    const hs = document.querySelector<HTMLElement>(".site-header .shell");
    if (hs) {
      const hr = hs.getBoundingClientRect();
      const hp = parseFloat(getComputedStyle(hs).paddingLeft) || 0;
      html.style.setProperty("--rail-dx", `${Math.round(railX + mr.left - (hr.left + hp / 2))}px`);
    }

    // Polilínea: baja recta y se desvía 45° dentro del propio carril a mitad de
    // cada tramo largo (rasgo de pista de PCB). Siempre desciende: lenAtY es una
    // búsqueda binaria sobre y.
    const jog = narrow ? -6 : 22;
    const aj = Math.abs(jog);
    // Arranca en el borde superior del <main>, bajo el LED de la marca del header.
    const p: Pt[] = [[railX, 0], [railX, raw[0].y]];
    for (let i = 1; i < raw.length; i++) {
      const y1 = raw[i - 1].y + 56;
      const y2 = raw[i].y - 56;
      if (y2 - y1 > aj * 2 + 80) {
        const ym = y1 + (y2 - y1) * 0.38;
        p.push([railX, ym], [railX + jog, ym + aj], [railX + jog, y2 - aj], [railX, y2]);
      }
      p.push([railX, raw[i].y]);
    }
    p.push([railX, Math.min(mr.height, raw[raw.length - 1].y + 160)]);
    pts = p;
    cum = [0];
    for (let i = 1; i < pts.length; i++)
      cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    L = cum[cum.length - 1];

    const d = "M" + pts.map((q) => `${q[0]} ${q[1]}`).join(" L");
    base.setAttribute("d", d);
    lit.setAttribute("d", d);
    trail.setAttribute("d", d);
    lit.style.strokeDasharray = `${L} ${L}`;
    trail.style.strokeDasharray = `${TRAIL} ${L + TRAIL}`;

    // Tarjetas cableadas: solo las que arrancan en el borde del contenido (la
    // primera de cada fila) reciben un ramal hasta su pin; las demás no llevan
    // pin, así ningún ramal cruza otra tarjeta.
    const cards = Array.from(main.querySelectorAll<HTMLElement>(".tb-pin"))
      .map((pin) => pin.parentElement)
      .filter((c): c is HTMLElement => !!c && c.getClientRects().length > 0);
    const wired = cards.flatMap((card) => {
      const sh = card.closest<HTMLElement>(".shell");
      if (!sh) return [];
      const shr = sh.getBoundingClientRect();
      const cl = shr.left + (parseFloat(getComputedStyle(sh).paddingLeft) || 0);
      const cr = card.getBoundingClientRect();
      const on = Math.abs(cr.left - cl) < 3;
      card.toggleAttribute("data-wired", on);
      return on ? [{ card, x: cr.left - mr.left, y: Math.round(cr.top - mr.top + 22) }] : [];
    });

    const mk = (cls: string) => {
      const g = document.createElementNS(SVG, "g");
      g.setAttribute("class", cls);
      g.append(document.createElementNS(SVG, "path"), document.createElementNS(SVG, "circle"));
      return g;
    };
    const xAt = (y: number) => ptAtLen(lenAtY(y))[0];
    const major: RailNode[] = raw.map((r) => {
      const g = mk("c-node");
      const [br, c] = g.children as unknown as [SVGPathElement, SVGCircleElement];
      br.setAttribute("d", `M${railX + 6} ${r.y} H${Math.max(railX + 9, r.contentX - 10)}`);
      c.setAttribute("cx", String(railX));
      c.setAttribute("cy", String(r.y));
      c.setAttribute("r", "5");
      return { sec: r.sec, len: lenAtY(r.y), g };
    });
    const minor: RailNode[] = wired.map((w) => {
      const g = mk("c-node c-node--wire");
      const [br, c] = g.children as unknown as [SVGPathElement, SVGCircleElement];
      const x0 = xAt(w.y);
      br.setAttribute("d", `M${x0} ${w.y} H${Math.max(x0 + 4, w.x - 4)}`); // termina en el pin (−4 px), sin entrar en la tarjeta
      c.setAttribute("cx", String(x0));
      c.setAttribute("cy", String(w.y));
      c.setAttribute("r", "2.5");
      return { card: w.card, len: lenAtY(w.y), g };
    });
    nodeLayer.replaceChildren(...major.map((n) => n.g), ...minor.map((n) => n.g));
    nodes = [...major, ...minor];
    lastC = -1;
    barW = bar?.clientWidth ?? 0;
    if (incident) {
      const r = incident.getBoundingClientRect();
      inc = { top: r.top + window.scrollY, h: r.height || 1, steps: incSteps.map((li) => li.getBoundingClientRect().top + window.scrollY) };
    }
    if (!animate) paint(L);
    else wake();
  };

  const setOn = (n: RailNode, on: boolean) => {
    if (n.g.classList.contains("is-on") === on) return;
    n.g.classList.toggle("is-on", on);
    n.card?.toggleAttribute("data-wire-on", on);
    if (n.sec) {
      n.sec.toggleAttribute("data-lit", on);
      if (on) n.sec.setAttribute("data-powered", "");
    }
  };

  const paint = (c: number) => {
    if (Math.abs(c - lastC) < 0.05) return;
    lastC = c;
    lit.style.strokeDashoffset = String(L - c);
    trail.style.strokeDashoffset = String(TRAIL - c);
    for (const n of nodes) setOn(n, c >= n.len - 2);
    if (pk) {
      const [x, y] = ptAtLen(c);
      pk.style.transform = `translate3d(${x}px,${y}px,0)`;
    }
  };

  const offs: (() => void)[] = [];
  let rt: number | undefined;
  const ro = new ResizeObserver(() => {
    window.clearTimeout(rt);
    rt = window.setTimeout(build, 80);
  });
  ro.observe(main);
  offs.push(() => {
    ro.disconnect();
    window.clearTimeout(rt);
  });
  document.fonts?.ready.then(() => build());
  build();

  if (!animate) {
    html.classList.add("circuit-static");
    return () => {
      offs.forEach((f) => f());
      html.classList.remove("circuit-static");
      [base, lit, trail, nodeLayer].forEach((n) => n.remove());
    };
  }

  /* ─── Paquete + spotlight + imanes + progreso + incidente ─────────────── */
  const target = () => lenAtY(window.scrollY - mainTop + window.innerHeight * READ_LINE);
  const S = new Spring(0, 0.32, 1);
  // Entrada: el paquete baja hasta la línea de lectura y enciende el hero. Si
  // se llega a media página (ancla, recarga), arranca cerca para no barrer todo.
  const t0 = target();
  S.snap(Math.max(0, t0 - window.innerHeight * 0.6));
  S.set(t0);

  const fine = finePointer();
  const spot = document.querySelector<HTMLElement>(".spotlight");
  const spotIn = spot?.firstElementChild as HTMLElement | null;
  const SPOT = 240;
  const GRID = 22;
  const mx = new Spring(window.innerWidth * 0.7, 0.22, 1);
  const my = new Spring(window.innerHeight * 0.4, 0.22, 1);
  let spotSeen = !fine;

  type Mag = { el: HTMLElement; x: Spring; y: Spring };
  const mags = new Map<HTMLElement, Mag>();
  let magCur: HTMLElement | null = null;

  let lastSpot = "";
  let lastBar = -1;
  let lastFill = -1;

  const task = (dt: number) => {
    const sy = window.scrollY;
    const vh = window.innerHeight;
    S.set(target());
    let busy = S.step(dt, 0.05);
    paint(S.x);

    if (spot && spotIn) {
      let sx: number;
      let syy: number;
      if (fine) {
        busy = mx.step(dt, 0.1) || busy;
        busy = my.step(dt, 0.1) || busy;
        sx = mx.x;
        syy = my.x;
      } else {
        const [px, py] = ptAtLen(S.x);
        sx = px;
        syy = py + mainTop - sy;
      }
      const ox = sx - SPOT;
      const oy = syy - SPOT;
      // La retícula de la página está anclada al documento: el patrón interno
      // se desplaza lo justo para que sus puntos caigan sobre los de la página.
      const ix = -(((ox % GRID) + GRID) % GRID);
      const iy = -((((oy + sy) % GRID) + GRID) % GRID);
      const key = `${ox | 0},${oy | 0},${ix | 0},${iy | 0}`;
      if (key !== lastSpot) {
        lastSpot = key;
        spot.style.transform = `translate3d(${ox}px,${oy}px,0)`;
        spotIn.style.transform = `translate3d(${ix}px,${iy}px,0)`;
      }
      if (spotSeen) spot.classList.add("is-on");
    }

    if (bar) {
      const max = document.documentElement.scrollHeight - vh;
      const p = max > 0 ? clamp(sy / max, 0, 1) : 0;
      if (Math.abs(p - lastBar) > 0.0005) {
        lastBar = p;
        bar.style.setProperty("--p", p.toFixed(4));
        if (barPk) {
          barPk.style.transform = `translate3d(${(p * Math.max(0, barW - 5)).toFixed(1)}px,0,0)`;
          barPk.style.opacity = p > 0.001 ? "1" : "0";
        }
      }
    }

    if (incident) {
      const line = sy + vh * READ_LINE;
      const f = clamp((line - inc.top) / inc.h, 0, 1);
      if (Math.abs(f - lastFill) > 0.001) {
        lastFill = f;
        incident.style.setProperty("--fill", f.toFixed(3));
        incSteps.forEach((li, i) => li.classList.toggle("is-pending", (inc.steps[i] ?? 0) > line));
      }
    }

    for (const m of mags.values()) {
      const a = m.x.step(dt, 0.05);
      const b = m.y.step(dt, 0.05);
      if (a || b) {
        busy = true;
        m.el.style.translate = `${m.x.x.toFixed(2)}px ${m.y.x.toFixed(2)}px`;
      } else if (!m.x.t && !m.y.t) {
        m.el.style.translate = "";
        mags.delete(m.el);
      } else m.el.style.translate = `${m.x.x}px ${m.y.x}px`;
    }
    return busy;
  };
  offs.push(addTask(task));

  const onScroll = () => wake();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  offs.push(() => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  });

  if (fine) {
    const MAG_X = 0.28;
    const MAG_Y = 0.4;
    const CAP = 10;
    const release = (el: HTMLElement | null) => {
      const m = el && mags.get(el);
      if (m) {
        m.x.set(0);
        m.y.set(0);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      mx.set(e.clientX);
      my.set(e.clientY);
      if (!spotSeen) {
        spotSeen = true;
        mx.snap(e.clientX);
        my.snap(e.clientY);
      }
      const el = (e.target as Element | null)?.closest?.<HTMLElement>(".magnetic") ?? null;
      if (el !== magCur) {
        release(magCur);
        magCur = el;
      }
      if (el && !(el as HTMLButtonElement).disabled) {
        let m = mags.get(el);
        if (!m) {
          m = { el, x: new Spring(0, 0.32, 0.72), y: new Spring(0, 0.32, 0.72) };
          mags.set(el, m);
        }
        // El rect incluye el desplazamiento actual: se descuenta para medir
        // contra el centro en reposo (si no, el imán se persigue a sí mismo).
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2 - m.x.x;
        const cy = r.top + r.height / 2 - m.y.x;
        m.x.set(clamp((e.clientX - cx) * MAG_X, -CAP, CAP));
        m.y.set(clamp((e.clientY - cy) * MAG_Y, -CAP * 0.8, CAP * 0.8));
      }
      wake();
    };
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        release(magCur);
        magCur = null;
        spot?.classList.remove("is-on");
        spotSeen = false;
        wake();
      }
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    offs.push(() => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      mags.forEach((m) => (m.el.style.translate = ""));
    });
  }

  html.classList.add("circuit-on");
  return () => {
    offs.forEach((f) => f());
    html.classList.remove("circuit-on");
    spot?.classList.remove("is-on");
    [base, lit, trail, nodeLayer].forEach((n) => n.remove());
    main.querySelectorAll("[data-lit]").forEach((s) => s.removeAttribute("data-lit"));
  };
}
