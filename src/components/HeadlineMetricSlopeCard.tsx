import React, { useMemo } from "react";
import { scaleLinear } from "d3-scale";
import { max, min } from "d3-array";
import { formatCurrencyCompact, formatNumberCompact, familyAccent } from "../utils/format";
import type { HeadlineMetricDatum } from "../types";
import { PillBadge } from "./PillBadge";

/**
 * Slope card:
 * - PREVIOUS is always on the LEFT (xL)
 * - CURRENT is always on the RIGHT (xR)
 * - Y encodes the value => diagonal slope up/down
 */
const W = 260, H = 110;
const P = 12;          // inner padding
const xL = P + 6;      // left dot x
const xR = W - P - 6;  // right dot x

export default function HeadlineMetricSlopeCard({ d }: { d: HeadlineMetricDatum }) {
  const lo = min([d.current, d.previous]) ?? 0;
  const hi = max([d.current, d.previous]) ?? 1;
  const pad = Math.max(hi - lo, hi) * 0.12; // breathing room
  const y = useMemo(
    () => scaleLinear().domain([lo - pad, hi + pad]).range([H - 20, 18]),
    [lo, hi, pad]
  );

  const yPrev = y(d.previous);
  const yCurr = y(d.current);

  const delta = d.previous === 0 ? 0 : ((d.current - d.previous) / d.previous) * 100;
  const fmt = d.unit === "US$" ? formatCurrencyCompact : formatNumberCompact;
  const accent = familyAccent(d.family);

  // avoid label collisions with top/bottom edges
  const prevLabelDy = yPrev < 30 ? 12 : -8;
  const currLabelDy = yCurr > H - 30 ? -10 : 16;

  return (
    <div className="panel metric-card" aria-label={d.label}>
      <div className="hstack" style={{ justifyContent: "space-between", marginBottom: 6 }}>
        <strong>{d.label}</strong>
        <PillBadge>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%</PillBadge>
      </div>

      <svg width={W} height={H} role="img" aria-label={`${d.label}: previous vs current`}>
        {/* faint vertical guides so the left gutter doesn't feel empty */}
        <line x1={xL} y1={10} x2={xL} y2={H - 10} stroke="var(--ring)" strokeDasharray="2,4" />
        <line x1={xR} y1={10} x2={xR} y2={H - 10} stroke="var(--ring)" strokeDasharray="2,4" />

        {/* connector with slope */}
        <line x1={xL} y1={yPrev} x2={xR} y2={yCurr}
              stroke={accent} strokeWidth={3} strokeLinecap="round" />

        {/* previous (left) */}
        <circle cx={xL} cy={yPrev} r={5} fill="var(--panel)" stroke="var(--muted)" strokeWidth={2} />
        <text x={xL} y={yPrev + prevLabelDy} textAnchor="start" className="caption">{fmt(d.previous)}</text>

        {/* current (right) */}
        <circle cx={xR} cy={yCurr} r={6} fill={accent} />
        <text x={xR} y={yCurr + currLabelDy} textAnchor="end" className="caption">{fmt(d.current)}</text>
      </svg>
    </div>
  );
}
