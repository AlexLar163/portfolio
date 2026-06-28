"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { profile } from "@/data/profile";
import { sendContact, type ContactState } from "@/app/actions/contact";

export function EditorialContact() {
  const tc = useTranslations("contact");
  const [state, action, pending] = useActionState<ContactState, FormData>(
    sendContact,
    null,
  );
  const last = useRef({ name: "", email: "", message: "" });

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
    <form
      className="ed-form"
      action={action}
      onSubmit={(e) => {
        const f = e.currentTarget;
        last.current = {
          name: (f.elements.namedItem("name") as HTMLInputElement)?.value ?? "",
          email: (f.elements.namedItem("email") as HTMLInputElement)?.value ?? "",
          message:
            (f.elements.namedItem("message") as HTMLTextAreaElement)?.value ?? "",
        };
      }}
    >
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px" }}
      />
      <label>
        {tc("name")}
        <input name="name" required placeholder={tc("namePlaceholder")} />
      </label>
      <label>
        {tc("email")}
        <input
          name="email"
          type="email"
          required
          placeholder={tc("emailPlaceholder")}
        />
      </label>
      <label>
        {tc("message")}
        <textarea
          name="message"
          rows={4}
          required
          placeholder={tc("messagePlaceholder")}
        />
      </label>
      <button className="ed-btn ed-btn-solid" disabled={pending}>
        {pending ? tc("sending") : tc("send")}
      </button>
      {state?.status === "success" && <p className="ed-msg ok">{tc("success")}</p>}
      {state?.status === "error" && <p className="ed-msg err">{tc("error")}</p>}
    </form>
  );
}
