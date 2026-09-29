/** «2026-01» → «ene 2026» / «Jan 2026». */
export function formatMonth(ym: string, locale: string, month: "short" | "long" = "short") {
  const [y, m] = ym.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { month, year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(y, m - 1, 1)))
    .replace(/\.(?=\s)/, "")
    .replace(" de ", " ");
}

/** Período con Intl; sin `end` = actualidad. */
export function formatPeriod(start: string, end: string | undefined, locale: string, present: string) {
  return `${formatMonth(start, locale)} – ${end ? formatMonth(end, locale) : present}`;
}

/** Peso legible de un archivo: «142 KB». */
export function formatBytes(bytes: number, locale: string) {
  const kb = bytes / 1024;
  const n = new Intl.NumberFormat(locale, { maximumFractionDigits: kb >= 1024 ? 1 : 0 });
  return kb >= 1024 ? `${n.format(kb / 1024)} MB` : `${n.format(Math.max(1, kb))} KB`;
}
