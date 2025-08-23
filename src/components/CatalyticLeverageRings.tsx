// src/components/CatalyticLeverageRings.tsx
import React, { useMemo } from "react";

type Item = {
  id: string;
  name: string;
  bankUS: number;   // Afreximbank amount (US$)
  otherUS: number;  // Mobilized / crowd-in amount (US$)
};

type Props = {
  items: Item[];
  /** ≥3× acceptable (gold) */
  thresholdMin?: number;
  /** ≥4.5× strong (brand green) */
  thresholdGood?: number;
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, isFinite(x) ? x : 0));
}

function Ring({
  r,
  stroke,
  pct,
  color,
  track = "rgba(0,0,0,0.08)",
  cap = "round",
}: {
  r: number;
  stroke: number;
  pct: number; // 0..1
  color: string;
  track?: string;
  cap?: "round" | "butt" | "square";
}) {
  const C = 2 * Math.PI * r;
  const p = clamp01(pct);
  const dash = C * p;
  const gap = Math.max(0.0001, C - dash);
  return (
    <g transform="rotate(-90)">
      <circle cx={0} cy={0} r={r} fill="none" stroke={track} strokeWidth={stroke} strokeLinecap={cap} />
      <circle
        cx={0}
        cy={0}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap={cap}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={0}
      />
    </g>
  );
}

export default function CatalyticLeverageRings({
  items,
  thresholdMin = 3.0,
  thresholdGood = 4.5,
}: Props) {
  // derive leverage (other/bank) and inner share (other/total), with guards
  const rows = useMemo(() => {
    return items.map((d) => {
      const bank = Math.max(0, d.bankUS || 0);
      const other = Math.max(0, d.otherUS || 0);
      const lev = bank > 0 ? other / bank : 0;          // outer ring + center label
      const total = bank + other;
      const otherShare = total > 0 ? other / total : 0; // inner ring
      return { ...d, bank, other, lev, otherShare };
    });
  }, [items]);

  const maxLev = Math.max(1, ...rows.map((r) => r.lev));
  // keep headroom so 5–6× doesn’t look 100% full; round to .5
  const scaleMax = Math.ceil(Math.max(thresholdGood * 1.1, maxLev * 1.1) * 2) / 2;

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "stretch" }}>
        {rows.map((r) => {
          const outerPct = clamp01(r.lev / scaleMax);
          const outerColor =
            r.lev >= thresholdGood ? "var(--accent)" : r.lev >= thresholdMin ? "var(--gold-500)" : "#C14953";

          return (
            <div
              key={r.id}
              className="panel"
              style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 240, flex: "1 1 240px" }}
            >
              {/* Rings */}
              <svg width={86} height={86} aria-hidden>
                <g transform="translate(43,43)">
                  {/* OUTER: leverage progress vs scale */}
                  <Ring r={32} stroke={8} pct={outerPct} color={outerColor} />
                  {/* INNER: share of Other funding */}
                  <Ring r={22} stroke={6} pct={r.otherShare} color="var(--teal-600)" />
                  {/* Center label */}
                  <text x={0} y={4} textAnchor="middle" style={{ fontSize: 14, fontWeight: 700, fill: "var(--ink)" }}>
                    {r.lev.toFixed(1)}×
                  </text>
                </g>
              </svg>

              {/* Text block */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.name}
                </div>
                <div className="caption" style={{ marginTop: 2 }}>
                  Bank {formatMoney(r.bank)} • Other {formatMoney(r.other)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend (kept compact and consistent with your palette) */}
      <div className="caption" style={{ marginTop: 8 }}>
        <span style={{ padding: "2px 6px", background: "#EAD1D3", color: "#5A1A1F", borderRadius: 6 }}>
          below {thresholdMin.toFixed(0)}×
        </span>
        &nbsp;
        <span style={{ padding: "2px 6px", background: "rgba(243,198,19,.25)", borderRadius: 6 }}>
          ≥ {thresholdMin.toFixed(0)}×
        </span>
        &nbsp;
        <span style={{ padding: "2px 6px", background: "rgba(51,185,144,.22)", borderRadius: 6 }}>
          ≥ {thresholdGood.toFixed(1)}×
        </span>
      </div>
    </div>
  );
}

function formatMoney(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}
