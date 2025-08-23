// src/components/SmeFunnel.tsx
import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import { scaleLinear } from "d3-scale";
import type { SmeFunnelItem, SmeStage } from "../types";
import { PillBadge } from "./PillBadge";

/** track container width (your pattern) */
function useWidth<T extends HTMLElement>(initial = 320) {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(initial);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => setW(entries[0].contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, width: w };
}

const ORDER: SmeStage[] = ["eligible", "approved", "disbursed", "active"];
const LABEL: Record<SmeStage, string> = {
  eligible: "Eligible",
  approved: "Approved",
  disbursed: "Disbursed",
  active: "Active",
};

/** rough width estimator for value chip sizing (caption ~12px) */
function estimateTextWidth(label: string) {
  return Math.max(28, label.length * 7.2);
}

export default function SmeFunnel({
  data,
  totalInvestmentUSD,
  stageForRate = "active",
  className,
}: {
  data: SmeFunnelItem[];
  /** For the header micro-stat “SMEs per $1M (stage)” */
  totalInvestmentUSD?: number;
  stageForRate?: SmeStage;
  className?: string;
}) {
  // canonical stage order
  const items = useMemo(
    () => ORDER.map((s) => data.find((d) => d.stage === s)).filter(Boolean) as SmeFunnelItem[],
    [data]
  );

  const maxTotal = Math.max(...items.map((d) => d.total || 0), 1);

  // layout
  const { ref, width } = useWidth<HTMLDivElement>();
  const pad = { t: 10, r: 8, b: 8, l: 8 };
  const barH = 26;
  const gap = 14;
  const innerW = Math.max(0, width - pad.l - pad.r);
  const labelColW = Math.min(140, Math.max(80, innerW * 0.22)); // dedicated label column
  const barAreaW = Math.max(0, innerW - labelColW);
  const innerH = items.length * (barH + gap) - gap;
  const H = innerH + pad.t + pad.b;

  // scale for bar widths
  const x = useMemo(() => scaleLinear().domain([0, maxTotal]).range([0, barAreaW]), [maxTotal, barAreaW]);

  // hover conversion
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // micro-stat (SMEs per $1M for selected stage)
  const numer = items.find((i) => i.stage === stageForRate)?.total ?? 0;
  const denomM = (totalInvestmentUSD ?? 0) / 1_000_000;
  const smesPer1M = denomM > 0 ? numer / denomM : null;

  return (
    <div ref={ref} className={className}>
      {/* micro-stat header */}
      <div className="card-head" style={{ marginBottom: 6 }}>
        <div className="caption" style={{ color: "var(--muted)" }}>
          SMEs per $1M <span className="muted">({LABEL[stageForRate]})</span>
        </div>
        {smesPer1M != null && (
          <PillBadge>
            {new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(smesPer1M)}
          </PillBadge>
        )}
      </div>

      {/* legend chips */}
      <div className="legend" style={{ marginBottom: 6 }}>
        <div className="legend-col">
          <span className="legend-chip">
            <i className="legend-dot" style={{ background: "var(--teal-700)" }} />
            Total SMEs
          </span>
          <span className="legend-chip">
            <i className="legend-dot" style={{ background: "var(--gold-500)" }} />
            Women-led
          </span>
          <span className="legend-chip">
            <i className="legend-dot" style={{ background: "var(--teal-600)" }} />
            Youth-led
          </span>
        </div>
      </div>

      {/* chart */}
      <svg width="100%" height={H} role="img" aria-label="SME Participation Funnel">
        {items.map((d, i) => {
          const y = pad.t + i * (barH + gap);

          // bar area starts after the label column
          const x0 = pad.l + labelColW;

          const w = x(d.total);
          const prev = i > 0 ? items[i - 1] : undefined;
          const prevW = prev ? x(prev.total) : 0;

          const womenW = d.womenLed != null ? x(Math.min(d.womenLed, d.total)) : 0;
          const youthW = d.youthLed != null ? x(Math.min(d.youthLed, d.total)) : 0;

          const conv = prev && prev.total > 0 ? Math.round((d.total / prev.total) * 100) : null;

          // label/value placement
          const valueLabel = d.total.toLocaleString();
          const placeInside = i === 0 || w > barAreaW - 56; // inside if near right edge (always inside for first)
          const chipPadX = 6;
          const chipPadY = 3;
          const chipW = placeInside ? estimateTextWidth(valueLabel) + chipPadX * 2 : 0;
          const chipH = 16 + chipPadY * 2;
          const chipX = Math.max(x0 + 2, x0 + w - chipW - 6);
          const chipY = y + barH / 2 - chipH / 2;

          return (
            <g
              key={d.stage}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              {/* left stage label column (never overlaps bars/overlays) */}
              <text
                x={pad.l + labelColW - 8}
                y={y + barH / 2}
                className="caption"
                fill="var(--teal-700)"
                textAnchor="end"
                dominantBaseline="middle"
              >
                {LABEL[d.stage]}
              </text>

              {/* connector & conversion label (on hover) */}
              {i > 0 && hoverIdx === i && (
                <>
                  <line
                    x1={x0 + Math.min(prevW, w)}
                    y1={y + barH / 2}
                    x2={x0 + Math.max(prevW, w)}
                    y2={y + barH / 2}
                    stroke="var(--ring)"
                    strokeDasharray="4 3"
                  />
                  <text
                    x={x0 + Math.min(prevW, w) + 6}
                    y={y + barH / 2 - 6}
                    className="caption"
                    fill="var(--teal-700)"
                  >
                    {conv != null ? `→ ${conv}%` : ""}
                  </text>
                </>
              )}

              {/* base bar */}
              <rect
                x={x0}
                y={y}
                width={w}
                height={barH}
                rx={5}
                fill="var(--teal-700)"
              >
                <title>
                  {`${LABEL[d.stage]} — ${d.total.toLocaleString()} SMEs${
                    conv != null ? ` • Conversion from previous: ${conv}%` : ""
                  }${d.womenLed != null ? ` • Women-led: ${d.womenLed.toLocaleString()}` : ""}${
                    d.youthLed != null ? ` • Youth-led: ${d.youthLed.toLocaleString()}` : ""
                  }`}
                </title>
              </rect>

              {/* overlays inside the bar */}
              {d.womenLed != null && (
                <rect
                  x={x0}
                  y={y + 4}
                  width={womenW}
                  height={3}
                  rx={2}
                  fill="var(--gold-500)"
                  pointerEvents="none"
                />
              )}
              {d.youthLed != null && (
                <rect
                  x={x0}
                  y={y + 8}
                  width={youthW}
                  height={3}
                  rx={2}
                  fill="var(--teal-600)"
                  pointerEvents="none"
                />
              )}

              {/* numeric value */}
              {placeInside ? (
                <>
                  {/* mask chip so overlays don’t slice the digits */}
                  <rect
                    x={chipX}
                    y={chipY}
                    width={chipW}
                    height={chipH}
                    rx={8}
                    fill="var(--teal-700)"
                    pointerEvents="none"
                  />
                  <text
                    x={chipX + chipW - chipPadX}
                    y={y + barH / 2}
                    className="caption"
                    dominantBaseline="middle"
                    textAnchor="end"
                    fill="#fff"
                    style={{ fontWeight: 600 }}
                    pointerEvents="none"
                  >
                    {valueLabel}
                  </text>
                </>
              ) : (
                <text
                  x={x0 + w + 6}
                  y={y + barH / 2}
                  className="caption"
                  dominantBaseline="middle"
                  textAnchor="start"
                  fill="var(--fg)"
                  pointerEvents="none"
                >
                  {valueLabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="caption" style={{ marginTop: 6, color: "var(--muted)" }}>
        Hover a stage to see conversion from the previous step.
      </div>
    </div>
  );
}
