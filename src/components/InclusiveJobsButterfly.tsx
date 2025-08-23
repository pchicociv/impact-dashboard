import React, { useMemo, useRef, useState, useEffect } from "react";
import { scaleLinear } from "d3-scale";
import type { JobsByDemoItem } from "../types";
import SectionHeader from "./SectionHeader";

/* simple width hook (same style as Slope cards) */
function useWidth<T extends HTMLElement>(initial = 320) {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(initial);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const el = entries[0]?.contentRect?.width ?? initial;
      setW(Math.max(220, el));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, width: w };
}

/**
 * InclusiveJobsButterfly
 * - FlowingData-style butterfly bars per small multiple (sector/region)
 * - Women (left) vs Men (right), Youth (18–35) overlay band across both
 * - Horizontal by default; switches to vertical mirror under 520px wide
 */
export default function InclusiveJobsButterfly({
  title = "Inclusive Employment — Jobs by Demographics",
  items,
  sortBy = "total",
}: {
  title?: string;
  items: JobsByDemoItem[];
  sortBy?: "total" | "womenShare" | "youthShare";
}) {
  const { ref, width } = useWidth<HTMLDivElement>(360);
  const vertical = width < 420;

  const data = useMemo(() => {
    const enriched = items.map((d) => {
      const womenShare = d.total > 0 ? d.women / d.total : 0;
      const men = Math.max(0, d.total - d.women);
      const menShare = d.total > 0 ? men / d.total : 0;
      const youthShare = d.total > 0 ? d.youth / d.total : 0;
      return { ...d, men, womenShare, menShare, youthShare };
    });
    const sorter =
      sortBy === "womenShare"
        ? (a: any, b: any) => b.womenShare - a.womenShare
        : sortBy === "youthShare"
        ? (a: any, b: any) => b.youthShare - a.youthShare
        : (a: any, b: any) => b.total - a.total;
    return enriched.sort(sorter);
  }, [items, sortBy]);

  // scales (percent to px)
  const W = Math.min(420, width - 24);     // inner available per card content
  const H = vertical ? 120 : 72;
  const barThickness = vertical ? 20 : 16;
  const x = scaleLinear().domain([0, 0.5]).range([0, (W - 80) / 2]);  // half width for each side
  const y = scaleLinear().domain([0, 0.5]).range([0, (H - 40) / 2]);  // half height for top/bottom

  return (
    <div className="panel soft" ref={ref}>
      {/* Legend */}
      <div className="legend" aria-label="Legend: Women vs Men with Youth overlay">
        <div className="legend-col">
          <span className="legend-chip"><i className="legend-dot jobs" style={{ background: "var(--accent-3)" }} /> Women</span>
          <span className="legend-chip"><i className="legend-dot jobs" style={{ background: "var(--accent-4)" }} /> Men</span>
          <span className="legend-chip"><i className="legend-dot jobs" style={{ background: "var(--teal-300)", boxShadow: "inset 0 0 0 2px var(--teal-700)" }} /> Youth (18–35) overlay</span>
        </div>
      </div>

      <div className="bfly-grid">
        {data.map((d) => {
          const wL = x(Math.min(0.5, d.womenShare)); // left width in px
          const wR = x(Math.min(0.5, d.menShare));   // right width in px
          const youth = Math.min(1, d.youthShare);
          const yBand = vertical ? y(youth / 2) : x(youth / 2); // symmetric half-band

          const labelWomen = `${Math.round(d.womenShare * 100)}%`;
          const labelMen   = `${Math.round(d.menShare * 100)}%`;
          const labelYouth = `${Math.round(youth * 100)}%`;

          const tipWomen = `${d.scopeName} — Women: ${d.women.toLocaleString()} (${labelWomen}) of ${d.total.toLocaleString()} jobs`;
          const tipMen   = `${d.scopeName} — Men: ${d.men.toLocaleString()} (${labelMen}) of ${d.total.toLocaleString()} jobs`;
          const tipYouth = `${d.scopeName} — Youth (18–35): ${d.youth.toLocaleString()} (${labelYouth}) of ${d.total.toLocaleString()} jobs`;

          return (
            <div key={d.scopeId} className="bfly-card panel">
              <div className="card-head">
                <h4 className="card-title">{d.scopeName}</h4>
                {d.period ? <span className="badge">{d.period}</span> : null}
              </div>

              {/* Responsive butterfly */}
              {!vertical ? (
                <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label={`Women vs Men with Youth overlay for ${d.scopeName}`}>
                  {/* center axis */}
                  <line x1={W/2} y1={H/2 - 26} x2={W/2} y2={H/2 + 26} stroke="var(--ring)" />
                  {/* women left */}
                  <rect x={W/2 - wL} y={(H - barThickness)/2} width={wL} height={barThickness} fill="var(--accent-3)" rx={3}
                        title={tipWomen} />
                  {/* men right */}
                  <rect x={W/2} y={(H - barThickness)/2} width={wR} height={barThickness} fill="var(--accent-4)" rx={3}
                        title={tipMen} />
                  {/* youth overlay band (semi-transparent across both sides) */}
                  <rect x={(W/2) - yBand} y={(H - (barThickness+8))/2} width={yBand*2} height={barThickness+8}
                        fill="var(--teal-300)" opacity={0.35} stroke="var(--teal-700)" strokeDasharray="3,3" rx={4}
                        title={tipYouth} />
                  {/* labels */}
                  <text x={W/2 - wL - 4} y={H/2 + 4} textAnchor="end" className="caption">{labelWomen}</text>
                  <text x={W/2 + wR + 4} y={H/2 + 4} textAnchor="start" className="caption">{labelMen}</text>
                  <text x={W/2} y={H/2 - barThickness - 6} textAnchor="middle" className="caption">{`Youth ${labelYouth}`}</text>
                </svg>
              ) : (
                <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label={`Women vs Men with Youth overlay for ${d.scopeName} (vertical)`}>
                  {/* center axis */}
                  <line x1={W/2 - 30} y1={H/2} x2={W/2 + 30} y2={H/2} stroke="var(--ring)" />
                  {/* women up */}
                  <rect x={(W - barThickness)/2} y={(H/2) - y(d.womenShare)} width={barThickness} height={y(d.womenShare)} fill="var(--accent-3)" rx={3}
                        title={tipWomen} />
                  {/* men down */}
                  <rect x={(W - barThickness)/2} y={H/2} width={barThickness} height={y(d.menShare)} fill="var(--accent-4)" rx={3}
                        title={tipMen} />
                  {/* youth overlay band */}
                  <rect x={(W - (barThickness+8))/2} y={(H/2) - yBand} width={barThickness+8} height={yBand*2}
                        fill="var(--teal-300)" opacity={0.35} stroke="var(--teal-700)" strokeDasharray="3,3" rx={4}
                        title={tipYouth} />
                  {/* labels */}
                  <text x={W/2 - barThickness - 6} y={(H/2) - y(d.womenShare) - 4} textAnchor="end" className="caption">{labelWomen}</text>
                  <text x={W/2 - barThickness - 6} y={(H/2) + y(d.menShare) + 12} textAnchor="end" className="caption">{labelMen}</text>
                  <text x={W/2} y={(H/2) - yBand - 6} textAnchor="middle" className="caption">{`Youth ${labelYouth}`}</text>
                </svg>
              )}

              {/* footer row with absolutes */}
              <div className="grid cols-3" style={{ marginTop: 6 }}>
                <div className="caption"><strong>Total</strong><br />{d.total.toLocaleString()}</div>
                <div className="caption"><strong>Women</strong><br />{d.women.toLocaleString()}</div>
                <div className="caption"><strong>Youth</strong><br />{d.youth.toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
