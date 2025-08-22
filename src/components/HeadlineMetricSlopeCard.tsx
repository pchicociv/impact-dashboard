import React, { useMemo } from "react";
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";
import { formatCurrencyCompact, formatNumberCompact, familyAccent } from "../utils/format";
import type { HeadlineMetricDatum } from "../types";
import { PillBadge } from "./PillBadge";

const W = 260, H = 96, P = 16;

export default function HeadlineMetricSlopeCard({ d }: { d: HeadlineMetricDatum }) {
  const maxV = max([d.current, d.previous]) ?? 0;
  const x = useMemo(() => scaleLinear().domain([0, maxV]).range([P, W - P]), [maxV]);

  const prevX = x(d.previous);
  const currX = x(d.current);
  const delta = d.previous === 0 ? 0 : ((d.current - d.previous) / d.previous) * 100;

  const fmt = d.unit === "US$" ? formatCurrencyCompact : formatNumberCompact;

  return (
    <div className="panel metric-card" aria-label={d.label}>
      <div className="hstack" style={{ justifyContent: "space-between", marginBottom: 6 }}>
        <strong>{d.label}</strong>
        <PillBadge>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%</PillBadge>
      </div>
      <svg width={W} height={H} role="img" aria-label={`${d.label} current vs previous`}>
        {/* connector */}
        <line x1={prevX} y1={H / 2} x2={currX} y2={H / 2} stroke={familyAccent(d.family)} strokeWidth={2} />
        {/* previous */}
        <circle cx={prevX} cy={H / 2} r={5} fill="none" stroke="var(--muted)" strokeWidth={2} />
        {/* current */}
        <circle cx={currX} cy={H / 2} r={6} fill={familyAccent(d.family)} />
        {/* labels */}
        <text x={prevX} y={H / 2 - 10} textAnchor="middle" className="caption">{fmt(d.previous)}</text>
        <text x={currX} y={H / 2 + 20} textAnchor="middle" className="caption">{fmt(d.current)}</text>
      </svg>
    </div>
  );
}
