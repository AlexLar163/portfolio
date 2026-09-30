"use client";

import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { sendContact, type ContactState } from "@/app/actions/contact";
import { DEMO_REQUEST_EVENT } from "@/components/projects/DemoRequestLink";
import { CopyEmail } from "./CopyEmail";

type Texts = {
  name: string;
  email: string;
  message: string;
  send: string;
  sending: string;
  success: string;
  errorSend: string;
  errName: string;
  errEmail: string;
  errMessage: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  messagePlaceholder: string;
  copy: string;
  copied: string;
};

type Field = "name" | "email" | "message";

// Mismas reglas que la acción del servidor (src/app/actions/contact.ts).
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
function validate(f: HTMLFormElement): Partial<Record<Field, true>> {
  const v = (k: Field) => String(new FormData(f).get(k) ?? "").trim();
  const e: Partial<Record<Field, true>> = {};
  if (v("name").length < 2) e.name = true;
  if (!EMAIL_RE.test(v("email"))) e.email = true;
  if (v("message").length < 5) e.message = true;
  return e;
}

export function ContactForm({ t, email }: { t: Texts; email: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, null);
  const [errors, setErrors] = useState<Partial<Record<Field, true>>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // «Pedirla»: precarga el mensaje solo si el campo está vacío y enfoca el textarea.
  useEffect(() => {
    const onRequest = (ev: Event) => {
      const msg = (ev as CustomEvent<{ message: string }>).detail?.message;
      const ta = messageRef.current;
      if (!ta) return;
      if (msg && !ta.value.trim()) ta.value = msg;
      window.setTimeout(() => ta.focus({ preventScroll: true }), 0);
    };
    window.addEventListener(DEMO_REQUEST_EVENT, onRequest);
    return () => window.removeEventListener(DEMO_REQUEST_EVENT, onRequest);
  }, []);

  useEffect(() => {
    if (state?.status === "success") successRef.current?.focus();
  }, [state]);

  // Con JS se despacha a mano: un <form action> de React 19 vacía los campos al
  // terminar la acción, y un envío fallido no puede costarle el mensaje a nadie.
  // Sin JS sigue funcionando el `action` del formulario.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const found = validate(form);
    setErrors(found);
    const first = (Object.keys(found) as Field[])[0];
    if (first) {
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    const data = new FormData(form);
    startTransition(() => action(data));
  };

  if (state?.status === "success") {
    return (
      <div ref={successRef} className="notice" tabIndex={-1} role="status">
        <p>{t.success}</p>
      </div>
    );
  }

  const serverFailed = state?.status === "error" && (state.reason === "config" || state.reason === "send");
  const errMsg: Record<Field, string> = { name: t.errName, email: t.errEmail, message: t.errMessage };
  const fieldProps = (k: Field) => ({
    id: `f-${k}`,
    name: k,
    className: "input",
    "aria-invalid": errors[k] ? (true as const) : undefined,
    "aria-describedby": errors[k] ? `f-${k}-err` : undefined,
    onInput: () => errors[k] && setErrors((prev) => ({ ...prev, [k]: undefined })),
  });
  const err = (k: Field) =>
    errors[k] ? (
      <p id={`f-${k}-err`} className="field__error">
        {errMsg[k]}
      </p>
    ) : null;

  return (
    <form ref={formRef} className="form" action={action} onSubmit={onSubmit} noValidate>
      {serverFailed && (
        <div className="notice notice--error" role="alert">
          <p>
            {t.errorSend} <a className="link" href={`mailto:${email}`}>{email}</a>
          </p>
          <p>
            <CopyEmail email={email} copy={t.copy} copied={t.copied} />
          </p>
        </div>
      )}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-company">Company</label>
        <input id="f-company" type="text" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="field">
        <label htmlFor="f-name">{t.name}</label>
        <input {...fieldProps("name")} autoComplete="name" required placeholder={t.namePlaceholder} />
        {err("name")}
      </div>
      <div className="field">
        <label htmlFor="f-email">{t.email}</label>
        <input
          {...fieldProps("email")}
          type="email"
          autoComplete="email"
          required
          placeholder={t.emailPlaceholder}
        />
        {err("email")}
      </div>
      <div className="field">
        <label htmlFor="f-message">{t.message}</label>
        <textarea {...fieldProps("message")} ref={messageRef} rows={8} required placeholder={t.messagePlaceholder} />
        {err("message")}
      </div>
      <button type="submit" className="btn btn--primary btn--lg form__submit" disabled={pending}>
        {pending ? t.sending : t.send}
      </button>
    </form>
  );
}
