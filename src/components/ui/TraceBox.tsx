/**
 * Trazo de circuito alrededor de una tarjeta (v3 «Circuito»). Dos rectángulos
 * con pathLength=1:
 *   .tb__pw → se dibuja una vez cuando su sección se enciende y se apaga;
 *   .tb__hv → se dibuja al hover o al foco dentro de la tarjeta.
 * El pin es el contacto de la tarjeta con la pista: se enciende con el trazo.
 *
 * Solo decoración (aria-hidden). La tarjeta necesita `position: relative`;
 * el SVG va 0,75 px hacia adentro, así el trazo de 1,5 px cae sobre el borde
 * y nunca sale de la caja (no hay nada que recortar).
 */
export function TraceBox({ i = 0, pin = true }: { i?: number; pin?: boolean }) {
  return (
    <>
      <svg className="tb" aria-hidden="true" focusable="false" style={{ ["--i" as string]: i }}>
        <rect className="tb__pw" width="100%" height="100%" rx="8" pathLength={1} />
        <rect className="tb__hv" width="100%" height="100%" rx="8" pathLength={1} />
      </svg>
      {pin && <i className="tb-pin" aria-hidden="true" />}
    </>
  );
}
