import React from "react";
import type { SdgStat } from "../types";

export default function SdgWaffleGrid({ stats }: { stats: SdgStat[] }) {
  const cell = 10, cols = 10, rows = 10, gap = 1, W = cols * (cell + gap) - gap, H = rows * (cell + gap) - gap;

  return (
    <div className="grid cols-3">
      {stats.map(s => {
        const filled = Math.round((s.percentOfProjects / 100) * 100);
        return (
          <div className="panel" key={s.sdg}>
            <strong>{s.sdg}</strong>
            <div className="caption">{s.percentOfProjects}% of projects</div>
            <svg width={W} height={H} aria-label={`${s.sdg} waffle`}>
              {Array.from({ length: 100 }).map((_, i) => {
                const x = (i % cols) * (cell + gap);
                const y = Math.floor(i / cols) * (cell + gap);
                const on = i < filled;
                return <rect key={i} x={x} y={y} width={cell} height={cell} fill={on ? "var(--gold-500)" : "var(--teal-700)"} stroke="none" />;
              })}
            </svg>
            {s.exampleProject && <div className="caption" style={{ marginTop: 6 }}>e.g., {s.exampleProject}</div>}
          </div>
        );
      })}
    </div>
  );
}
