"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { checkFields, ELAPSED_FIELD, HONEYPOT_FIELD, MIN_FILL_MS } from "@/lib/contact-rules";

export type ContactState = {
  status: "idle" | "success" | "error";
  reason?: "invalid" | "config" | "send" | "rate";
} | null;

/**
 * Rate limit por IP en memoria (best effort): cada instancia del servidor
 * lleva su propia cuenta y se pierde al reciclarse. Frena una ráfaga, no un
 * ataque distribuido; para eso haría falta un almacén compartido.
 */
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 5;
const RATE_KEYS_MAX = 1000;
const hits = new Map<string, number[]>();

function limited(ip: string, now: number) {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  // Tope de memoria: se olvidan las IP más viejas (Map conserva el orden de alta).
  while (hits.size > RATE_KEYS_MAX) hits.delete(hits.keys().next().value!);
  return false;
}

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Sin saltos de línea ni controles en el asunto (encabezado del correo). */
const oneLine = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();

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
  // 2) Tiempo mínimo de llenado. Lo mide el cliente (reloj monotónico, sin
  //    desfase con el servidor); sin JS no llega y no se juzga.
  const elapsed = Number(formData.get(ELAPSED_FIELD));
  if (formData.has(ELAPSED_FIELD) && (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS)) {
    console.info("[contact] descartado: enviado en menos de", MIN_FILL_MS, "ms");
    return { status: "success" };
  }

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  // 3) Formato y longitud (mismas reglas que el cliente).
  if (Object.keys(checkFields({ name, email, message })).length) {
    return { status: "error", reason: "invalid" };
  }

  // 4) Rate limit por IP.
  if (limited(await clientIp(), Date.now())) {
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
