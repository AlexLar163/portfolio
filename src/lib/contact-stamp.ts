import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Sello de tiempo firmado del formulario de contacto (solo servidor).
 *
 * La home es estática: el sello no puede ir en el HTML. Con JS, el formulario
 * lo pide a la Server Action `issueContactStamp` al primer foco y lo envía con
 * el mensaje; la acción exige firma válida y 3 s ≤ antigüedad ≤ 2 h. Sin JS no
 * hay sello: el envío se acepta con un rate limit más estricto.
 *
 * Clave del HMAC, en orden: CONTACT_STAMP_SECRET (recomendada), RESEND_API_KEY
 * (existe en producción porque sin ella no se envía nada), el id del deploy de
 * Vercel (estable dentro de un deploy) y, solo en desarrollo, una constante.
 */
const KEY =
  process.env.CONTACT_STAMP_SECRET ||
  process.env.RESEND_API_KEY ||
  process.env.VERCEL_DEPLOYMENT_ID ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  "dev-only-contact-stamp";

const mac = (ts: string) => createHmac("sha256", KEY).update(`contact:${ts}`).digest("base64url");

export function signStamp(now = Date.now()) {
  const ts = String(now);
  return `${ts}.${mac(ts)}`;
}

/** Antigüedad en ms de un sello válido; null si está mal formado o la firma no coincide. */
export function stampAge(stamp: string, now = Date.now()): number | null {
  const [ts, sig] = stamp.split(".");
  if (!ts || !sig || !/^\d{13}$/.test(ts)) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(mac(ts));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return now - Number(ts);
}
