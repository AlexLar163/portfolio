import { getTranslations } from "next-intl/server";
import { Check } from "lucide-react";
import { listOrder, nodes, STEP_NODES } from "@/data/infra";
import { incidentSteps, pipelineRows } from "@/data/devops";
import { MotionScene } from "@/motion/MotionScene";
import { InfraStage, type DiagramText, type NodeText } from "./InfraDiagram";
import { CapabilityBento, CapabilitySheet, PipelineTable } from "./Capabilities";
import { PauseToggle } from "@/components/ui/PauseToggle";

type Step = { title: string; text: string; data: string };

function Legend({ t }: { t: (k: string) => string }) {
  const line = (dash?: string, cap?: "round") => (
    <svg width="28" height="8" viewBox="0 0 28 8" aria-hidden>
      <path d="M1 4 H27" stroke="var(--ink-3)" strokeWidth="1.5" strokeDasharray={dash} strokeLinecap={cap} fill="none" />
    </svg>
  );
  const box = (dash?: string) => (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden>
      <rect x="0.5" y="0.5" width="19" height="13" rx="2" fill="var(--raised)" stroke="var(--line-strong)" strokeDasharray={dash} />
    </svg>
  );
  return (
    <div className="stage-legend">
      <h3 className="sr-only">{t("legendTitle")}</h3>
      <ul className="legend t-small">
        <li>{line()}{t("legend.traffic")}</li>
        <li>{line("5 4")}{t("legend.control")}</li>
        <li>{line("1 4", "round")}{t("legend.scheduled")}</li>
        <li>{box()}{t("legend.production")}</li>
        <li>{box("4 3")}{t("legend.onDemand")}</li>
      </ul>
    </div>
  );
}

/** Chips conectados por una línea de 1 px (carril de CI/CD). */
function Chips({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ol className={`chips t-data ${className}`}>
      {items.map((s, i) => (
        <li key={s} className="chip" data-chip={i} style={{ ["--i" as string]: i }}>
          <Check className="chip__check" size={14} strokeWidth={2} aria-hidden />
          <span>{s}</span>
        </li>
      ))}
    </ol>
  );
}

export async function DevOps() {
  const t = await getTranslations("devops");
  const inf = await getTranslations("infra");

  const nodeText = Object.fromEntries(
    nodes
      .filter((n) => n.interactive)
      .map((n) => [n.id, inf.raw(`nodes.${n.id}`) as NodeText]),
  );

  const diagramText: DiagramText = {
    title: t("diagramTitle"),
    desc: t("diagramDesc"),
    outside: t("outside"),
    hint: t("diagramHint"),
    onDemand: t("legend.onDemand"),
    production: t("legend.production"),
    vps: inf.raw("frames.vps") as DiagramText["vps"],
    docker: inf.raw("frames.docker.label") as string[],
    edgeLabels: inf.raw("edges") as Record<string, string[]>,
    nodes: nodeText,
  };

  const stepIds = Object.keys(STEP_NODES);
  const steps = t.raw("steps") as Record<string, Step>;
  // El lead se lee palabra por palabra en la escena: se parte aquí, no con SplitText.
  const words = t("lead").split(" ");

  return (
    <section id="devops" aria-labelledby="devops-title" className="section section--canvas devops" data-inview>
      <div className="shell shell--wide">
        <div className="devops-scene">
          <InfraStage
            text={diagramText}
            panelLabels={{ facts: t("panelFacts"), kind: { "on-demand": t("legend.onDemand") } }}
            stepIds={stepIds}
            title={
              <header key="title" className="stage-title">
                <h2 id="devops-title" className="t-chapter">
                  {t("title")}
                </h2>
                <p className="t-lead stage-lead">
                  {words.map((w, i) => (
                    <span key={i}>
                      <span className="w">{w}</span>
                      {i < words.length - 1 ? " " : ""}
                    </span>
                  ))}
                </p>
              </header>
            }
            steps={
              <ol key="steps" className="stage-steps" aria-label={t("stepsLabel")}>
                {stepIds.map((id, i) => (
                  <li key={id} data-step={id} data-active={i === 0 ? "" : undefined}>
                    <h3 className="step__title">{steps[id].title}</h3>
                    <p className="step__text">{steps[id].text}</p>
                    <p className="step__data t-data">{steps[id].data}</p>
                  </li>
                ))}
              </ol>
            }
            foot={
              <div key="foot" className="stage-foot">
                <div className="stage-ci" role="group" aria-labelledby="stage-ci-label">
                  <p id="stage-ci-label" className="t-small ink-3">
                    {t("ci.label")}
                  </p>
                  <Chips items={t.raw("ci.chips") as string[]} className="chips--ci" />
                </div>
                <div className="stage-foot__end">
                  <Legend t={(k) => t(k)} />
                  <PauseToggle target=".devops" pauseLabel={t("pauseTraffic")} playLabel={t("playTraffic")} />
                </div>
              </div>
            }
          />
        </div>

        {/* Alternativa sin JS y para lectores de pantalla: mismo contenido del panel. */}
        <details className="disclosure infra-list">
          <summary>{t("listSummary")}</summary>
          <div className="disclosure__body">
            <ol className="disclosure__inner">
              {listOrder.map((id) => {
                const n = nodeText[id];
                return (
                  <li key={id}>
                    <h3 className="t-small">{n.label}</h3>
                    <p className="t-small">{n.detail}</p>
                    <p className="t-data ink-3">{n.facts.join(" · ")}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </details>

        {/* Respuesta a incidente: sin nombre de cliente */}
        <article className="grid incident" aria-labelledby="incident-title">
          <header className="incident__head">
            <h3 id="incident-title" className="t-h3 incident__title">
              {t("incident.title")}
            </h3>
            <p className="ink-2">{t("incident.lead")}</p>
          </header>
          <ol className="incident__steps">
            {incidentSteps.map((id) => (
              <li key={id}>
                <h4>{t(`incident.steps.${id}.title`)}</h4>
                <p>{t(`incident.steps.${id}.text`)}</p>
              </li>
            ))}
          </ol>
        </article>

        <CapabilityBento />
        <details className="disclosure caps-more">
          <summary>{t("bento.sheetSummary")}</summary>
          <div className="disclosure__body">
            <div className="disclosure__inner">
              <CapabilitySheet />
              <PipelineTable />
            </div>
          </div>
        </details>

        {/* CI/CD en carriles (la tabla real queda en el disclosure de arriba). */}
        <div className="lanes">
          <h3 className="subhead">{t("lanesTitle")}</h3>
          <ul className="lanes__list">
            {pipelineRows.map((r, l) => (
              <li key={r.id} className="lane" data-reveal style={{ ["--l" as string]: l }}>
                <p className="lane__name">{r.project}</p>
                <Chips items={t.raw(`pipeline.rows.${r.id}.steps`) as string[]} />
                <p className="lane__target t-data">{t(`pipeline.rows.${r.id}.target`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <MotionScene name="devops" />
    </section>
  );
}
