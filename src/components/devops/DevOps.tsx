import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { listOrder, nodes } from "@/data/infra";
import { capabilityGroups, incidentSteps, pipelineRows } from "@/data/devops";
import { resolveImage, SIZES } from "@/lib/media";
import { Section } from "@/components/ui/Section";
import { InfraDiagram, type DiagramText, type NodeText } from "./InfraDiagram";

type CapItem = { text: string; data?: string };

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
    <div>
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

  return (
    <Section id="devops" title={t("title")} lead={t("lead")} width="wide" canvas>
      <InfraDiagram
        text={diagramText}
        panelLabels={{ facts: t("panelFacts"), kind: { "on-demand": t("legend.onDemand") } }}
      />

      <div className="infra__below">
        <Legend t={(k) => t(k)} />
        {/* Alternativa sin JS y para lectores de pantalla: mismo contenido del panel. */}
        <details className="infra-list">
          <summary>{t("listSummary")}</summary>
          <ol>
            {listOrder.map((id) => {
              const n = nodeText[id];
              return (
                <li key={id}>
                  <h3 className="t-small">
                    {n.label}
                  </h3>
                  <p className="t-small">{n.detail}</p>
                  <p className="t-data ink-3">{n.facts.join(" · ")}</p>
                </li>
              );
            })}
          </ol>
        </details>
      </div>

      {/* Respuesta a incidente — sin nombre de cliente */}
      <article className="grid incident" aria-labelledby="incident-title">
        <header className="incident__head">
          <h3 id="incident-title" className="t-h3">
            {t("incident.title")}
          </h3>
          <p className="ink-2">
            {t("incident.lead")}
          </p>
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

      {/* Hoja de capacidades */}
      <div className="caps">
        <h3 className="subhead">{t("capabilitiesTitle")}</h3>
        {capabilityGroups.map((g) => {
          const items = t.raw(`capabilities.${g.id}.items`) as CapItem[];
          const alts = g.media ? ((t.raw(`capabilities.${g.id}.mediaAlt`) as string[]) ?? []) : [];
          const media = (g.media ?? [])
            .map((ref, i) => ({ img: resolveImage(ref), alt: alts[i] ?? "" }))
            .filter((m) => m.img);
          return (
            <section key={g.id} className="grid caps__row" aria-labelledby={`cap-${g.id}`}>
              <h4 id={`cap-${g.id}`} className="caps__title t-h3">
                {t(`capabilities.${g.id}.title`)}
              </h4>
              <div className="caps__body">
                <ul className="caps__items">
                  {items.map((it) => (
                    <li key={it.text}>
                      {it.text}
                      {it.data && <span className="t-data">{it.data}</span>}
                    </li>
                  ))}
                </ul>
                {media.length > 0 && (
                  <div className={`caps__media${media.length === 1 ? " caps__media--one" : ""}`}>
                    {media.map(({ img, alt }) => (
                      <figure
                        key={img!.src}
                        className={`capture${img!.w / img!.h > 1.5 ? " capture--wide" : ""}${
                          img!.fit === "contain" ? " capture--contain" : ""
                        }${img!.position === "top" ? " capture--top" : ""}`}
                      >
                        <Image src={img!.src} alt={alt} fill sizes={SIZES.capture} />
                      </figure>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* CI/CD */}
      <div className="pipeline">
        <h3 className="subhead">{t("pipeline.title")}</h3>
        <div className="table-scroll" role="region" aria-labelledby="pipeline-caption" tabIndex={0}>
          <table>
            <caption id="pipeline-caption" className="t-small">
              {t("pipeline.caption")}
            </caption>
            <thead>
              <tr>
                <th scope="col">{t("pipeline.project")}</th>
                <th scope="col">{t("pipeline.steps")}</th>
                <th scope="col">{t("pipeline.target")}</th>
              </tr>
            </thead>
            <tbody>
              {pipelineRows.map((r) => (
                <tr key={r.id}>
                  <th scope="row">{r.project}</th>
                  <td>
                    <ul className="steps t-data">
                      {(t.raw(`pipeline.rows.${r.id}.steps`) as string[]).map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="ink-2">{t(`pipeline.rows.${r.id}.target`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}
