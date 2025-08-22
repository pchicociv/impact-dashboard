import React, { useEffect, useMemo, useRef, useState } from "react";
import { scaleLinear } from "d3-scale";
import { max, min } from "d3-array";
import { formatCurrencyCompact, formatNumberCompact, familyAccent } from "../utils/format";
import type { HeadlineMetricDatum } from "../types";
import { PillBadge } from "./PillBadge";

/* simple resize observer */
function useWidth<T extends HTMLElement>(initial = 260) {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setW(Math.max(220, width)); // clamp to a sane minimum
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, width: w };
}

/**
 * Slope card (responsive):
 * - PREVIOUS is always on the LEFT
 * - CURRENT is always on the RIGHT
 * - Y encodes the value => diagonal slope up/down
 */
const H = 110;
const P = 16; // inner padding for SVG

export default function HeadlineMetricSlopeCard({ d }: { d: HeadlineMetricDatum }) {
  const { ref, width } = useWidth<HTMLDivElement>();
  const W = width;                // measured card content width
  const xL = P + 6;               // left dot x
  const xR = W - P - 6;           // right dot x

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
    <div className="panel metric-card" aria-label={d.label} ref={ref}>
      <div className="card-head">
        <strong className="card-title" title={d.label}>{d.label}</strong>
        <PillBadge title={`Δ ${Math.abs(delta).toFixed(1)}%`}>
          {delta >= 0 ? "▲" : "▼"}&nbsp;{Math.abs(delta).toFixed(1)}%
        </PillBadge>
      </div>

      {/* responsive SVG: fills the card width */}
      <svg
        className="slope-svg"
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label={`${d.label}: previous vs current`}
      >
        {/* subtle left/right guides */}
        <line x1={xL} y1={10} x2={xL} y2={H - 10} stroke="var(--teal-600)" strokeDasharray="2,4" />
        <line x1={xR} y1={10} x2={xR} y2={H - 10} stroke="var(--teal-600)" strokeDasharray="2,4" />

        {/* connector with slope */}
        <line x1={xL} y1={yPrev} x2={xR} y2={yCurr} stroke={accent} strokeWidth={3} strokeLinecap="round" />

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
