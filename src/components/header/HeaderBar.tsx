"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { LocaleSwitch } from "./LocaleSwitch";

type Props = {
  sections: { id: string; label: string }[];
  cv: { href: string; label: string };
  /** Estado real (permitido): punto --live + texto corto; el largo va para lectores. */
  availability: { short: string; full: string };
  labels: { home: string; primary: string; menuOpen: string; menuClose: string; lang: string };
  name: string;
};

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function HeaderBar({ sections, cv, availability, labels, name }: Props) {
  const headerRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  // Borde inferior al pasar 8 px de scroll.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const onScroll = () => el.setAttribute("data-scrolled", String(window.scrollY > 8));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sección activa: la que cruza la franja del 45–50 % de la ventana.
  useEffect(() => {
    const ids = new Set(sections.map((s) => s.id));
    // Solo secciones de primer nivel; «Más demos» declara a qué entrada pertenece (data-nav).
    const targets = Array.from(document.querySelectorAll<HTMLElement>("main > section[id]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const id = (e.target as HTMLElement).dataset.nav ?? e.target.id;
          setActive(ids.has(id) ? id : null);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [sections]);

  // Indicador de 2 px: se mueve con transform y width.
  const placeIndicator = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const link = active ? list.querySelector<HTMLElement>(`a[href="#${active}"]`) : null;
    if (!link) {
      list.style.setProperty("--o", "0");
      return;
    }
    list.style.setProperty("--x", `${link.offsetLeft}px`);
    list.style.setProperty("--w", `${link.offsetWidth}px`);
    list.style.setProperty("--o", "1");
  }, [active]);

  useIsoLayoutEffect(() => {
    placeIndicator();
  }, [placeIndicator]);

  useEffect(() => {
    const ro = new ResizeObserver(placeIndicator);
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
  }, [placeIndicator]);

  // Esc cierra el menú y devuelve el foco al botón.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header ref={headerRef} className="site-header" data-scrolled="false">
      <div className="shell">
        <div className="site-header__bar">
          {/* El LED cae sobre la x de la pista del circuito: la pista «sale» de aquí. */}
          <a href="#inicio" className="brand" aria-label={labels.home}>
            <i className="brand__led" aria-hidden />
            {name}
          </a>
          <p className="availability" title={availability.full}>
            <span className="availability__short" aria-hidden>
              {availability.short}
            </span>
            <span className="sr-only">{availability.full}</span>
          </p>
          <nav className="nav-desktop" aria-label={labels.primary}>
            <ul ref={listRef}>
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} aria-current={active === s.id ? "true" : undefined}>
                    {s.label}
                  </a>
                </li>
              ))}
              <li className="nav-indicator" aria-hidden />
            </ul>
          </nav>
          <LocaleSwitch label={labels.lang} />
          <a href={cv.href} className="btn btn--secondary btn--sm header-cv magnetic" download>
            {cv.label}
          </a>
          <button
            ref={menuBtnRef}
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mobile-panel"
            aria-label={open ? labels.menuClose : labels.menuOpen}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} strokeWidth={1.5} aria-hidden /> : <Menu size={20} strokeWidth={1.5} aria-hidden />}
          </button>
        </div>
      </div>
      {/* Progreso de lectura con su paquete a la cabeza (lo mueve circuit.ts). */}
      <div className="read-progress" aria-hidden>
        <i />
      </div>
      <div id="mobile-panel" className="mobile-panel" data-open={open}>
        <nav className="shell" aria-label={labels.primary}>
          <ul>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={() => setOpen(false)}>
                  {s.label}
                </a>
              </li>
            ))}
            <li>
              <a href={cv.href} download onClick={() => setOpen(false)}>
                {cv.label} (PDF)
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
