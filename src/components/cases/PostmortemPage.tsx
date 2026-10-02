import { getTranslations } from "next-intl/server";
import { ArrowLeft, CircleCheck, Clock, ShieldAlert, type LucideIcon } from "lucide-react";
import { Breadcrumb, SubPage, SubSection } from "./SubPage";
import { Ticks } from "./Ticks";

type Phase = "intrusion" | "detection" | "containment" | "recovery" | "hardening";
type ActionStatus = "done" | "pending" | "accepted";

type PmText = {
  eyebrow: string;
  title: string;
  subtitle: string;
  summary: string;
  ui: Record<string, string> & {
    statuses: Record<ActionStatus, string>;
    phases: Record<Phase, string>;
  };
  impact: string[];
  durations: { value: string; label: string }[];
  timeline: { when: string; what: string; phase: Phase; key?: boolean }[];
  detection: string;
  cause: string;
  factors: string[];
  containment: string[];
  recovery: string[];
  hardening: { before: string; after: string }[];
  appliedLater: string[];
  pending: string[];
  rotated: string;
  notRotated: string;
  wentWell: string[];
  wentBad: string[];
  actions: { text: string; status: ActionStatus; note?: string }[];
  lessons: string[];
};

const STATUS_ICON: Record<ActionStatus, LucideIcon> = {
  done: CircleCheck,
  pending: Clock,
  accepted: ShieldAlert,
};

const List = ({ items, className = "card__list" }: { items: string[]; className?: string }) => (
  <ul className={className}>
    {items.map((x) => (
      <li key={x}>
        <Ticks text={x} />
      </li>
    ))}
  </ul>
);

/**
 * Postmortem del incidente de septiembre, en formato de informe SRE sin culpas.
 * Sin nombre de cliente ni del sitio de origen (CASOS.md §B). La línea de tiempo
 * lleva `data-fill`: con motion, circuit.ts la llena con el scroll.
 */
export async function PostmortemPage({ locale }: { locale: string }) {
  const root = await getTranslations();
  const cu = await getTranslations("cases.ui");
  const pm = root.raw("postmortem") as PmText;
  const ui = pm.ui;
  const home = `/${locale}`;

  return (
    <SubPage>
      <article aria-labelledby="inicio-title">
        <section id="inicio" className="case-hero pm-hero" aria-labelledby="inicio-title">
          <div className="shell">
            <Breadcrumb
              label={cu("breadcrumb")}
              items={[{ href: home, text: cu("home") }, { href: `${home}#devops`, text: "DevOps" }, { text: pm.eyebrow }]}
            />
            <header className="pm-hero__head">
              <p className="case-hero__tags">
                <span className="tag">{pm.eyebrow}</span>
              </p>
              <h1 id="inicio-title" className="t-h2 case-hero__title" data-rail>
                {pm.title}
              </h1>
              <p className="t-lead case-hero__sub">{pm.subtitle}</p>
            </header>

            {/* Resumen e impacto: la caja destacada del informe. */}
            <div className="pm-box" role="group" aria-labelledby="pm-summary-title">
              <h2 id="pm-summary-title" className="subhead">
                {ui.summary}
              </h2>
              <p className="pm-box__summary">{pm.summary}</p>
              <div className="grid pm-box__grid">
                <div className="pm-box__impact">
                  <h3 className="t-small ink-3 pm-box__label">{ui.impact}</h3>
                  <List items={pm.impact} />
                </div>
                <div className="pm-box__durations">
                  <h3 className="t-small ink-3 pm-box__label">{ui.durations}</h3>
                  <dl className="pm-stats">
                    {pm.durations.map((d) => (
                      <div key={d.label} className="pm-stat">
                        <dt className="t-small ink-2">{d.label}</dt>
                        <dd className="pm-stat__value">{d.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SubSection id="linea-de-tiempo" title={ui.timeline}>
          <ol className="pm-timeline" data-fill>
            {pm.timeline.map((e) => (
              <li key={e.when} className="pm-event" data-phase={e.phase} data-key={e.key ? "" : undefined}>
                <p className="pm-event__meta">
                  <time className="t-data pm-event__when">{e.when}</time>
                  <span className="pm-phase t-small">{ui.phases[e.phase]}</span>
                </p>
                <p className="pm-event__what">
                  <Ticks text={e.what} />
                </p>
              </li>
            ))}
          </ol>
        </SubSection>

        <SubSection id="causa-raiz" title={ui.rootCause}>
          <div className="grid case-split case-split--even">
            <div className="case-prose">
              <h3 className="subhead">{ui.detection}</h3>
              <p>{pm.detection}</p>
              <h3 className="subhead pm-gap">{ui.cause}</h3>
              <p>
                <Ticks text={pm.cause} />
              </p>
            </div>
            <div>
              <h3 className="subhead">{ui.factors}</h3>
              <List items={pm.factors} />
            </div>
          </div>
        </SubSection>

        <SubSection id="contencion" title={ui.containment}>
          <List items={pm.containment} className="card__list pm-list" />
        </SubSection>

        <SubSection id="recuperacion" title={ui.recovery}>
          <List items={pm.recovery} className="card__list pm-list" />
        </SubSection>

        <SubSection id="hardening" title={ui.hardening}>
          <h3 className="subhead">{ui.hardeningVerified}</h3>
          <div className="table-wrap pm-table-wrap">
            <table className="pm-table" role="table">
              <thead role="rowgroup">
                <tr role="row">
                  <th role="columnheader" scope="col">{ui.before}</th>
                  <th role="columnheader" scope="col">{ui.after}</th>
                </tr>
              </thead>
              <tbody role="rowgroup">
                {pm.hardening.map((r) => (
                  <tr key={r.before} role="row">
                    <td role="cell" className="ink-2" data-label={ui.before}>
                      <Ticks text={r.before} />
                    </td>
                    <td role="cell" data-label={ui.after}>
                      <Ticks text={r.after} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid case-split case-split--even pm-gap">
            <div>
              <h3 className="subhead pm-state pm-state--done">
                <CircleCheck size={18} strokeWidth={2} aria-hidden />
                {ui.appliedLater}
              </h3>
              <List items={pm.appliedLater} />
            </div>
            <div>
              <h3 className="subhead pm-state pm-state--pending">
                <Clock size={18} strokeWidth={2} aria-hidden />
                {ui.pending}
              </h3>
              <List items={pm.pending} />
            </div>
          </div>
          <h3 className="subhead pm-gap">{ui.rotation}</h3>
          <dl className="pm-rotation">
            <div>
              <dt>{ui.rotated}</dt>
              <dd className="ink-2">{pm.rotated}</dd>
            </div>
            <div>
              <dt>{ui.notRotated}</dt>
              <dd className="ink-2">{pm.notRotated}</dd>
            </div>
          </dl>
        </SubSection>

        <SubSection id="retrospectiva" title={ui.retro}>
          <div className="grid case-split case-split--even">
            <div>
              <h3 className="subhead">{ui.wentWell}</h3>
              <List items={pm.wentWell} />
            </div>
            <div>
              <h3 className="subhead">{ui.wentBad}</h3>
              <List items={pm.wentBad} />
            </div>
          </div>
        </SubSection>

        <SubSection id="acciones" title={ui.actions}>
          <div className="table-wrap pm-table-wrap">
            <table className="pm-table pm-actions" role="table">
              <thead role="rowgroup">
                <tr role="row">
                  <th role="columnheader" scope="col" className="pm-actions__n">
                    #
                  </th>
                  <th role="columnheader" scope="col">{ui.action}</th>
                  <th role="columnheader" scope="col">{ui.status}</th>
                </tr>
              </thead>
              <tbody role="rowgroup">
                {pm.actions.map((a, i) => {
                  const Icon = STATUS_ICON[a.status];
                  return (
                    <tr key={a.text} role="row" data-status={a.status}>
                      <td role="cell" className="t-data ink-3 pm-actions__n">{i + 1}</td>
                      <td role="cell">
                        <Ticks text={a.text} />
                      </td>
                      <td role="cell">
                        <span className="pm-status t-small">
                          <Icon size={16} strokeWidth={2} aria-hidden />
                          {ui.statuses[a.status]}
                        </span>
                        {a.note && <span className="pm-status__note t-small ink-3">{a.note}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SubSection>

        <SubSection id="lecciones" title={ui.lessons}>
          <ol className="pm-lessons">
            {pm.lessons.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ol>
        </SubSection>
      </article>

      <nav className="section case-nav" aria-label={cu("more")}>
        <div className="shell">
          <p className="case-nav__end t-small">
            <a className="link" href={`${home}#devops`}>
              {ui.seeDiagram}
            </a>
            <a className="link" href={home}>
              <ArrowLeft className="link__icon" size={16} strokeWidth={1.5} aria-hidden />
              {cu("backHome")}
            </a>
          </p>
        </div>
      </nav>
    </SubPage>
  );
}
