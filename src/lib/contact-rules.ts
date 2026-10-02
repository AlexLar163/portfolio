/**
 * Reglas del formulario de contacto, compartidas por el cliente (ContactForm)
 * y la Server Action (src/app/actions/contact.ts): una sola fuente de verdad.
 * Un archivo "use server" solo puede exportar funciones async, por eso viven aquí.
 */
export type Field = "name" | "email" | "message";
export type FieldError = "short" | "long";

export const CONTACT_MIN = { name: 2, message: 5 } as const;
/** Topes de longitud: el email, el máximo de RFC 5321; el mensaje, ~5 pantallas. */
export const CONTACT_MAX: Record<Field, number> = { name: 100, email: 254, message: 5000 };

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Campo trampa (honeypot): nombre neutro para que el autocompletado no lo llene. */
export const HONEYPOT_FIELD = "contact_hp";
/** Sello de tiempo firmado por el servidor (src/lib/contact-stamp.ts). */
export const STAMP_FIELD = "contact_stamp";
/** Antigüedad mínima del sello al enviar: menos = bot. */
export const MIN_FILL_MS = 3000;
/** Antigüedad máxima del sello: más = sello reutilizado o robado. */
export const MAX_STAMP_AGE_MS = 2 * 60 * 60_000;

export function checkFields(v: Record<Field, string>): Partial<Record<Field, FieldError>> {
  const e: Partial<Record<Field, FieldError>> = {};
  if (v.name.length < CONTACT_MIN.name) e.name = "short";
  else if (v.name.length > CONTACT_MAX.name) e.name = "long";
  if (v.email.length > CONTACT_MAX.email) e.email = "long";
  else if (!EMAIL_RE.test(v.email)) e.email = "short";
  if (v.message.length < CONTACT_MIN.message) e.message = "short";
  else if (v.message.length > CONTACT_MAX.message) e.message = "long";
  return e;
}
