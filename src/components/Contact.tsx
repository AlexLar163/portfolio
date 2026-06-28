"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { profile } from "@/data/profile";
import { sendContact, type ContactState } from "@/app/actions/contact";
import { sound } from "@/lib/sound";

export function Contact() {
  const tr = useTranslations("sections");
  const tc = useTranslations("contact");
  const [state, action, pending] = useActionState<ContactState, FormData>(
    sendContact,
    null,
  );
  const last = useRef({ name: "", email: "", message: "" });

  // If email delivery isn't configured (or fails), fall back to the user's
  // own mail client so a message is never lost.
  useEffect(() => {
    if (
      state?.status === "error" &&
      (state.reason === "config" || state.reason === "send")
    ) {
      const { name, email, message } = last.current;
      const body = encodeURIComponent(`${message}\n\n— ${name} <${email}>`);
      const subject = encodeURIComponent(`Portfolio: ${name || "contacto"}`);
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    }
  }, [state]);

  return (
    <section className="section" id="contact">
      <h2 className="sec-title">
        <span className="a">&gt;</span> {tr("dialogue")}
      </h2>
      <span className="label">{tr("dialogueSub")}</span>

      <div className="dialogue">
        <div className="box dialog">
          <div className="who">{tc("player")}</div>
          <p style={{ marginBottom: 14 }}>{tc("intro")}</p>
          <div className="chan">
            {profile.socials.map((s) => (
              <a
                key={s.id}
                href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
              >
                <b>{s.label.toUpperCase()}</b>
                <span>{s.handle}</span>
              </a>
            ))}
          </div>
        </div>

        <form
          className="box dialog"
          action={action}
          onSubmit={(e) => {
            const f = e.currentTarget;
            last.current = {
              name: (f.elements.namedItem("name") as HTMLInputElement)?.value ?? "",
              email: (f.elements.namedItem("email") as HTMLInputElement)?.value ?? "",
              message:
                (f.elements.namedItem("message") as HTMLTextAreaElement)?.value ??
                "",
            };
            sound.beep(640, 0.06);
          }}
        >
          <div className="who">{tc("writeMessage")}</div>

          {/* Honeypot — hidden from humans */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px" }}
          />

          <div className="field">
            <label htmlFor="name">{tc("name")}</label>
            <input
              id="name"
              name="name"
              required
              placeholder={tc("namePlaceholder")}
            />
          </div>
          <div className="field">
            <label htmlFor="email">{tc("email")}</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder={tc("emailPlaceholder")}
            />
          </div>
          <div className="field">
            <label htmlFor="message">{tc("message")}</label>
            <textarea
              id="message"
              name="message"
              rows={3}
              required
              placeholder={tc("messagePlaceholder")}
            />
          </div>

          <button className="pixel-btn go" style={{ width: "100%" }} disabled={pending}>
            {pending ? tc("sending") : tc("send")}
          </button>

          {state?.status === "success" && (
            <p className="form-msg ok">{tc("success")}</p>
          )}
          {state?.status === "error" && (
            <p className="form-msg err">{tc("error")}</p>
          )}
        </form>
      </div>
    </section>
  );
}
