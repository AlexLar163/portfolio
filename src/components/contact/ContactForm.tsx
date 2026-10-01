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
  wireFrom: string;
  wireTo: string;
};

type Phase = "idle" | "sending" | "ok" | "err";

const EASE_IO = "cubic-bezier(0.65, 0, 0.35, 1)";
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
/** Hasta dónde viaja el paquete mientras la acción del servidor no responde. */
const WAIT_AT = 0.72;

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
  const errorRef = useRef<HTMLDivElement>(null);
  const wireRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  // El estado de la acción al enviar: solo un estado NUEVO cierra el viaje.
  const sentFrom = useRef<ContactState | undefined>(undefined);

  /**
   * Viaje del paquete por el cable (solo visual, v3): el envío real es la
   * Server Action. Va hasta el 72 % mientras espera; con éxito llega al nodo
   * «alex», con error vuelve. Cada tramo parte de donde está: interrumpible.
   */
  const travel = (to: number, ms: number, easing: string) => {
    const wire = wireRef.current;
    const pk = wire?.querySelector<HTMLElement>(".wire__pk");
    const lit = wire?.querySelector<HTMLElement>(".wire__lit");
    if (!wire || !pk || !lit) return Promise.resolve();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const w = wire.clientWidth;
    const from = new DOMMatrixReadOnly(getComputedStyle(pk).transform).m41 / (w || 1);
    pk.getAnimations().forEach((a) => a.cancel());
    lit.getAnimations().forEach((a) => a.cancel());
    const opts: KeyframeAnimationOptions = { duration: reduce ? 0 : ms, easing, fill: "forwards" };
    const a = pk.animate([{ transform: `translateX(${from * w}px)` }, { transform: `translateX(${to * w}px)` }], opts);
    lit.animate([{ transform: `scaleX(${from})` }, { transform: `scaleX(${to})` }], opts);
    return a.finished.then(() => undefined).catch(() => undefined);
  };

  useEffect(() => {
    if (phase !== "sending" || pending || state === sentFrom.current) return;
    if (state?.status === "success") {
      travel(1, 220, EASE_OUT).then(() => setPhase("ok"));
    } else if (state?.status === "error") {
      travel(0, 320, EASE_OUT).then(() => setPhase("err"));
    }
  }, [phase, pending, state]);

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

  // El botón queda deshabilitado mientras espera y el foco cae a <body>: se
  // devuelve al aviso (éxito o error del servidor), nunca se pierde (QA v3).
  useEffect(() => {
    if (state?.status === "success") successRef.current?.focus();
    else if (state?.status === "error" && (state.reason === "config" || state.reason === "send"))
      errorRef.current?.focus();
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
    sentFrom.current = state;
    setPhase("sending");
    travel(WAIT_AT, 420, EASE_IO);
    startTransition(() => action(data));
  };

  const done = state?.status === "success";
  // El cable del envío vive fuera del <form> (el botón lo une con `form=`): así
  // sobrevive al cambio a «enviado» y el paquete termina su viaje a la vista.
  const wire = (
    <div className="send-row" data-phase={phase}>
      {done ? (
        <span className="wire__end wire__end--from t-data" aria-hidden>
          {t.wireFrom}
        </span>
      ) : (
        <button
          type="submit"
          form="contact-form"
          className="btn btn--primary btn--lg form__submit magnetic"
          disabled={pending}
        >
          {pending ? t.sending : t.send}
        </button>
      )}
      <div className="wire" ref={wireRef} aria-hidden>
        <i className="wire__lit" />
        <i className="wire__pk" />
      </div>
      <span className="wire__end t-data" aria-hidden>
        <i />
        {t.wireTo}
      </span>
    </div>
  );

  if (done) {
    return (
      <div className="cform">
        <div ref={successRef} className="notice" tabIndex={-1} role="status">
          <p>{t.success}</p>
        </div>
        {wire}
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
    <div className="cform">
    <form id="contact-form" ref={formRef} className="form" action={action} onSubmit={onSubmit} noValidate>
      {serverFailed && (
        <div ref={errorRef} className="notice notice--error" role="alert" tabIndex={-1}>
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
    </form>
    {wire}
    </div>
  );
}
