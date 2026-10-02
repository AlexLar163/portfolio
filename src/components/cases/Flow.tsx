import { PauseToggle } from "@/components/ui/PauseToggle";
import { FlowMotion } from "./FlowMotion";

/**
 * Diagrama de flujo de un caso (4–7 pasos), en el lenguaje del diagrama DevOps:
 * nodos con caja elevada y LED sobre una espina, y un paquete que la recorre
 * (src/motion/flow.ts). Los nodos son HTML, no texto SVG: las frases del flujo
 * se parten solas a cualquier ancho (320→2560) en vez de depender de
 * coordenadas medidas a ojo para cada idioma.
 *
 * Es una lista ordenada: un lector de pantalla la lee como pasos 1…n.
 */
export function Flow({
  id,
  label,
  title,
  steps,
  pause,
  play,
}: {
  id: string;
  label: string;
  title?: string;
  steps: string[];
  pause: string;
  play: string;
}) {
  return (
    <figure className="flow" aria-labelledby={`${id}-cap`}>
      <figcaption id={`${id}-cap`} className="flow__cap">
        <span className="t-small ink-3">{label}</span>
        {title && <span className="flow__title">{title}</span>}
      </figcaption>
      <div className="flow__body">
        <ol className="flow__steps">
          {steps.map((s, i) => (
            <li key={i} className="flow__step" data-flow-step>
              <span className="flow__led" aria-hidden="true" />
              <div className="flow__node">
                <span className="flow__n t-data" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p>{s}</p>
              </div>
            </li>
          ))}
        </ol>
        <FlowMotion />
      </div>
      <div className="flow__foot">
        <PauseToggle target=".flow" pauseLabel={pause} playLabel={play} />
      </div>
    </figure>
  );
}
