"use client";

import { useEffect, useState } from "react";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
// Sun, Mon, Tue, Wed, Thu, Fri, Sat — GitHub only labels Mon/Wed/Fri.
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const WEEKS = 53;
const DAY = 86_400_000;

interface Cell {
  level: number;
  future: boolean;
}

// Deterministic "contribution" level for a given day (active-looking).
function levelFor(d: Date): number {
  const n = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
  const f = Math.abs(Math.sin(n) * 10000) % 1;
  if (f < 0.45) return 0;
  if (f < 0.66) return 1;
  if (f < 0.82) return 2;
  if (f < 0.93) return 3;
  return 4;
}

function build() {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay())); // Saturday of this week
  const start = new Date(end.getTime() - (WEEKS * 7 - 1) * DAY);

  const weeks: Cell[][] = [];
  const months: string[] = [];
  let total = 0;
  let prevMonth = -1;
  let cursor = new Date(start);

  for (let w = 0; w < WEEKS; w++) {
    const firstMonth = cursor.getMonth();
    months.push(firstMonth !== prevMonth ? MONTHS[firstMonth] : "");
    prevMonth = firstMonth;

    const recency = w / (WEEKS - 1); // 0 = oldest, 1 = most recent
    const col: Cell[] = [];
    for (let d = 0; d < 7; d++) {
      const future = cursor.getTime() > today.getTime();
      let lvl = future ? 0 : levelFor(cursor);
      // Recent weeks look busier (a developer actively shipping).
      if (!future && recency > 0.78 && lvl === 0 && cursor.getDate() % 3 !== 0) {
        lvl = 1 + (cursor.getDate() % 3);
      }
      if (!future) total += lvl;
      col.push({ level: lvl, future });
      cursor = new Date(cursor.getTime() + DAY);
    }
    weeks.push(col);
  }
  return { weeks, months, total };
}

export function ContributionGraph() {
  const [data, setData] = useState<ReturnType<typeof build> | null>(null);

  // Build on the client so it always reflects the most recent year
  // (and avoids any server/client date mismatch).
  useEffect(() => {
    setData(build());
  }, []);

  if (!data) {
    return <div className="ghcal" style={{ minHeight: 150 }} aria-hidden="true" />;
  }

  return (
    <div className="ghcal">
      <div className="ghcal-head">{data.total} contributions in the last year</div>
      <div className="ghcal-body">
        <div className="ghcal-days">
          {DAY_LABELS.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="ghcal-cols">
          <div className="ghcal-stack">
            <div className="ghcal-months">
              {data.months.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
            <div className="ghcal-grid">
              {data.weeks.flatMap((wk, wi) =>
                wk.map((c, di) => (
                  <i
                    key={`${wi}-${di}`}
                    className={c.future ? "lvlx" : `lvl${c.level}`}
                  />
                )),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
