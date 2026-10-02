/**
 * Texto de messages con identificadores entre `acentos graves` → <code>.
 * Los identificadores (wp-login.php, DISALLOW_FILE_MODS…) no se parten
 * (CSS de `.ticks code`); el contenedor se reacomoda alrededor.
 */
export function Ticks({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/);
  if (parts.length === 1) return text;
  return parts.map((p, i) => (i % 2 ? <code key={i}>{p}</code> : p));
}
