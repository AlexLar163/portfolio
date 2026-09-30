import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { capabilityGroups, pipelineRows } from "@/data/devops";
import { resolveImage } from "@/lib/media";

type CapItem = { text: string; data?: string };

/**
 * Bento de 4 celdas (DISENO-v2 §5.4): appsMonitor · Proxy y TLS · Contenedores ·
 * Automatización. Todo el texto sale de `devops.capabilities` (la misma fuente que
 * la hoja completa del disclosure): no hay datos escritos dos veces.
 */
export async function CapabilityBento() {
  const t = await getTranslations("devops");
  const items = (id: string) => t.raw(`capabilities.${id}.items`) as CapItem[];
  const strip = resolveImage({ slug: "appsmonitor", key: "recursos" });
  const stripNarrow = resolveImage({ slug: "appsmonitor", key: "recursos-movil" });
  const list = resolveImage({ slug: "appsmonitor", key: "proyectos", position: "top" });
  const flows = resolveImage({ slug: "automatizaciones", key: "portada" });
  const panelAlt = t.raw("capabilities.panel.mediaAlt") as string[];
  const flowsAlt = t.raw("capabilities.automation.mediaAlt") as string[];
  const flowsCaption = t.raw("capabilities.automation.mediaCaption") as string[];
  const containers = items("containers");
  const mem = containers.find((i) => i.data === "384 MB");

  return (
    <div className="bento-wrap">
      <h3 className="subhead">{t("bento.title")}</h3>
      <div className="bento">
        <section className="bento__cell bento__cell--a" data-reveal style={{ ["--i" as string]: 0 }} aria-labelledby="bento-panel">
          <h4 id="bento-panel" className="t-h3">
            {t("capabilities.panel.title")}
          </h4>
          <p className="ink-2">{items("panel")[0].text}</p>
          <ul className="bento__facts t-data">
            {(t.raw("bento.panelFacts") as string[]).map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          {strip && (
            <figure className="bento__strip">
              <Image
                className="capture-strip capture-strip--wide"
                src={strip.src}
                alt={panelAlt[0]}
                width={strip.w}
                height={strip.h}
                sizes="(min-width: 1440px) 760px, (min-width: 900px) 55vw, 100vw"
              />
              {stripNarrow && (
                <Image
                  className="capture-strip capture-strip--narrow"
                  src={stripNarrow.src}
                  alt={panelAlt[0]}
                  width={stripNarrow.w}
                  height={stripNarrow.h}
                  sizes="100vw"
                />
              )}
            </figure>
          )}
          {list && (
            <div className="capture capture--wide capture--top bento__shot" data-overflow-ok>
              <Image src={list.src} alt={panelAlt[1]} fill sizes="(min-width: 1440px) 760px, (min-width: 900px) 55vw, 100vw" />
            </div>
          )}
        </section>

        <section className="bento__cell bento__cell--b" data-reveal style={{ ["--i" as string]: 1 }} aria-labelledby="bento-proxy">
          <h4 id="bento-proxy" className="t-h3">
            {t("capabilities.proxy.title")}
          </h4>
          <ul className="bento__list">
            {items("proxy").map((it) => (
              <li key={it.text}>
                {it.text}
                {it.data && <span className="t-data">{it.data}</span>}
              </li>
            ))}
          </ul>
        </section>

        <section className="bento__cell bento__cell--c" data-reveal style={{ ["--i" as string]: 2 }} aria-labelledby="bento-containers">
          <h4 id="bento-containers" className="t-h3">
            {t("capabilities.containers.title")}
          </h4>
          {mem && (
            <p className="bento__metric">
              <span className="t-data bento__num">{mem.data}</span>
              <span className="t-small ink-3">{t("bento.memLabel")}</span>
            </p>
          )}
          <ul className="bento__list">
            {containers
              .filter((it) => it !== mem)
              .map((it) => (
                <li key={it.text}>
                  {it.text}
                  {it.data && <span className="t-data">{it.data}</span>}
                </li>
              ))}
          </ul>
        </section>

        <section className="bento__cell bento__cell--d" data-reveal style={{ ["--i" as string]: 3 }} aria-labelledby="bento-automation">
          {flows && (
            <figure className="bento__media">
              <div className="capture capture--wide" data-overflow-ok>
                <Image src={flows.src} alt={flowsAlt[0]} fill sizes="(min-width: 1440px) 760px, (min-width: 900px) 55vw, 100vw" />
              </div>
              {flowsCaption[0] && <figcaption className="t-small ink-3">{flowsCaption[0]}</figcaption>}
            </figure>
          )}
          <div className="bento__text">
            <h4 id="bento-automation" className="t-h3">
              {t("capabilities.automation.title")}
            </h4>
            <ul className="bento__list">
              {items("automation").map((it) => (
                <li key={it.text}>
                  {it.text}
                  {it.data && <span className="t-data">{it.data}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

/** Hoja completa de 9 grupos (v1), dentro del disclosure «Ver las 9 áreas». */
export async function CapabilitySheet() {
  const t = await getTranslations("devops");
  return (
    <div className="caps">
      <h3 className="subhead">{t("capabilitiesTitle")}</h3>
      {capabilityGroups.map((g) => {
        const items = t.raw(`capabilities.${g.id}.items`) as CapItem[];
        return (
          <section key={g.id} className="grid caps__row" aria-labelledby={`cap-${g.id}`}>
            <h4 id={`cap-${g.id}`} className="caps__title t-h3">
              {t(`capabilities.${g.id}.title`)}
            </h4>
            <ul className="caps__items caps__body">
              {items.map((it) => (
                <li key={it.text}>
                  {it.text}
                  {it.data && <span className="t-data">{it.data}</span>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/** Tabla real de CI/CD (v1): los datos no dependen del motion de los carriles. */
export async function PipelineTable() {
  const t = await getTranslations("devops");
  return (
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
  );
}
