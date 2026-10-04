"use client";

export const DEMO_REQUEST_EVENT = "portfolio:demo-request";

/** «Pedirla»: va a #contacto y precarga el mensaje si el campo está vacío (DISENO §6.7). */
export function DemoRequestLink({ label, message, name }: { label: string; message: string; name?: string }) {
  return (
    <a
      href="#contacto"
      className="link"
      onClick={() => {
        window.dispatchEvent(new CustomEvent(DEMO_REQUEST_EVENT, { detail: { message } }));
      }}
    >
      {label}
      {/* Nombre accesible con el sitio: «Pedirla: Lume…», no once «Pedirla» iguales. */}
      {name && <span className="sr-only">: {name}</span>}
    </a>
  );
}
