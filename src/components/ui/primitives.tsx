import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import type { ShowcaseLabel, Status } from "@/data/types";

/** Enlace de texto. `external` agrega la flecha y abre en otra pestaña. */
export function TextLink({
  href,
  children,
  external,
  newTabLabel,
  className = "",
  ...rest
}: ComponentProps<"a"> & { external?: boolean; newTabLabel?: string }) {
  return (
    <a
      href={href}
      className={`link ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
      {external && (
        <>
          <ArrowUpRight className="link__icon" strokeWidth={1.5} aria-hidden />
          {newTabLabel && <span className="sr-only"> {newTabLabel}</span>}
        </>
      )}
    </a>
  );
}

type ButtonProps = {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  href: string;
  external?: boolean;
  download?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  hrefLang?: string;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  href,
  external,
  download,
  icon,
  children,
  className = "",
  hrefLang,
}: ButtonProps) {
  const cls = `btn btn--${variant}${size !== "md" ? ` btn--${size}` : ""} ${className}`;
  return (
    <a
      href={href}
      className={cls}
      hrefLang={hrefLang}
      {...(download ? { download: true } : {})}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {icon}
      {children}
    </a>
  );
}

export function StatusBadge({
  status,
  label,
  className = "",
}: {
  status: Status;
  label: string;
  className?: string;
}) {
  const dot =
    status !== "captures-only" && status !== "internal" ? (
      <span className="status__dot" aria-hidden />
    ) : null;
  return (
    <span className={`status status--${status} ${className}`}>
      {dot}
      {label}
    </span>
  );
}

export function LabelTag({ label, text }: { label: ShowcaseLabel; text: string }) {
  return <span className={`tag${label === "demo" ? " tag--demo" : ""}`}>{text}</span>;
}

/** Lista de tecnologías en `data`, separadas por «·». */
export function TechList({ items, max = 5 }: { items: string[]; max?: number }) {
  return <span className="tech t-data">{items.slice(0, max).join(" · ")}</span>;
}

/* Íconos de marca: lucide 1.x ya no trae logos de marcas; se dibujan aquí. */
export function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}
