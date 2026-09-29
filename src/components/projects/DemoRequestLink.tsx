"use client";

export const DEMO_REQUEST_EVENT = "portfolio:demo-request";

/** «Pedirla»: va a #contacto y precarga el mensaje si el campo está vacío (DISENO §6.7). */
export function DemoRequestLink({ label, message }: { label: string; message: string }) {
  return (
    <a
      href="#contacto"
      className="link"
      onClick={() => {
        window.dispatchEvent(new CustomEvent(DEMO_REQUEST_EVENT, { detail: { message } }));
      }}
    >
      {label}
    </a>
  );
}
