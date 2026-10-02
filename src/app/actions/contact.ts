"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import {
  checkFields,
  HONEYPOT_FIELD,
  MAX_STAMP_AGE_MS,
  MIN_FILL_MS,
  STAMP_FIELD,
} from "@/lib/contact-rules";
import { signStamp, stampAge } from "@/lib/contact-stamp";

export type ContactState = {
  status: "idle" | "success" | "error";
  reason?: "invalid" | "config" | "send" | "rate";
} | null;

/**
 * Rate limit por IP en memoria (best effort): cada instancia del servidor
 * lleva su propia cuenta y se pierde al reciclarse. Frena una ráfaga, no un
 * ataque distribuido; para eso haría falta un almacén compartido.
 *   normal → con sello firmado válido (navegador con JS)
 *   strict → sin sello (sin JS, o un bot que lo omite)
 */
const RATE = {
  normal: { windowMs: 10 * 60_000, max: 5 },
  strict: { windowMs: 60 * 60_000, max: 2 },
} as const;
const RATE_KEYS_MAX = 1000;
const hits = new Map<string, number[]>();

function limited(key: string, now: number, { windowMs, max }: { windowMs: number; max: number }) {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  // Tope de memoria: se olvidan las IP más viejas (Map conserva el orden de alta).
  while (hits.size > RATE_KEYS_MAX) hits.delete(hits.keys().next().value!);
  return false;
}

/**
 * IP del visitante. En Vercel, `x-vercel-forwarded-for` y `x-real-ip` los pone
 * el borde y el cliente no puede falsificarlos (Vercel sobrescribe además
 * `x-forwarded-for`; docs «Request headers»). Fuera de Vercel, el ÚLTIMO salto
 * de `x-forwarded-for` es el que agregó el proxy más cercano; el primero lo
 * escribe quien quiera.
 */
async function clientIp() {
  const h = await headers();
  const vercel = h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercel) return vercel;
  const real = h.get("x-real-ip")?.trim();
  if (real) return real;
  const hops = (h.get("x-forwarded-for") ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  return hops[hops.length - 1] ?? "unknown";
}

/** Sin saltos de línea ni controles en el asunto (encabezado del correo). */
const oneLine = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();

/** Sello firmado que el formulario pide al primer foco (ver src/lib/contact-stamp.ts). */
export async function issueContactStamp(): Promise<string> {
  return signStamp();
}

export async function sendContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Antiespam: a un bot se le responde ÉXITO sin enviar nada (no aprende qué lo delató).
  // 1) Campo trampa: una persona nunca lo ve ni lo enfoca.
  if (String(formData.get(HONEYPOT_FIELD) || "").trim()) {
    console.info("[contact] descartado: campo trampa lleno");
    return { status: "success" };
  }
  // 2) Sello firmado: con JS siempre llega. Si llega, tiene que ser válido y
  //    tener entre 3 s y 2 h; si no llega (sin JS o un bot que lo omite), el
  //    envío sigue pero con el rate limit estricto.
  const now = Date.now();
  const stamp = formData.get(STAMP_FIELD);
  const stamped = typeof stamp === "string" && stamp.length > 0;
  if (stamped) {
    const age = stampAge(stamp, now);
    if (age === null || age < MIN_FILL_MS || age > MAX_STAMP_AGE_MS) {
      console.info("[contact] descartado: sello", age === null ? "inválido" : `de ${age} ms`);
      return { status: "success" };
    }
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  // 3) Formato y longitud (mismas reglas que el cliente).
  if (Object.keys(checkFields({ name, email, message })).length) {
    return { status: "error", reason: "invalid" };
  }

  // 4) Rate limit por IP (más estricto sin sello).
  const tier = stamped ? "normal" : "strict";
  if (limited(`${tier}:${await clientIp()}`, now, RATE[tier])) {
    return { status: "error", reason: "rate" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[contact] RESEND_API_KEY is not set — email not sent.");
    return { status: "error", reason: "config" };
  }

  try {
    const resend = new Resend(apiKey);
    // El SDK no lanza: devuelve { data, error }. Sin revisar `error`, un fallo
    // de Resend (clave inválida, remitente sin verificar) se mostraba como éxito.
    const { error } = await resend.emails.send({
      // Remitente del dominio verificado en Resend (ver .env.example).
      from: process.env.CONTACT_FROM || "Portfolio <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO || "alexlar163@gmail.com"],
      // «Responder» le escribe directo al visitante.
      replyTo: email,
      subject: `Contacto del portfolio: ${oneLine(name)}`,
      text: `Nombre: ${name}\nEmail: ${email}\n(Responder a este correo le escribe a ${email}.)\n\n${message}`,
    });
    if (error) {
      console.error("[contact] Resend rejected the email", error);
      return { status: "error", reason: "send" };
    }
    return { status: "success" };
  } catch (error) {
    console.error("[contact] send failed", error);
    return { status: "error", reason: "send" };
  }
}
