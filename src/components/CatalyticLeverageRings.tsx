import React, { useMemo } from "react";
import { arc } from "d3-shape";
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";
import { formatCurrencyCompact } from "../utils/format";

type Item = {
  id: string;
  name: string;
  bankUS: number;   // Afreximbank amount (US$)
  otherUS: number;  // Mobilized / crowd-in amount (US$)
};

export default function CatalyticLeverageRings({
  items,
  thresholdMin = 3.0,    // ≥3x acceptable
  thresholdGood = 4.5     // ≥4.5x strong
}: {
  items: Item[];
  thresholdMin?: number;
  thresholdGood?: number;
}) {
  const size = 110;          // per ring tile
  const R1 = 26;             // inner ring (bank = $1)
  const R2 = 36;             // outer ring (leverage progress)
  const stroke = 8;

  const leverages = items.map(x => (x.bankUS <= 0 ? 0 : x.otherUS / x.bankUS));
  const maxLev = max(leverages) ?? 0;
  const domainMax = Math.max(thresholdGood * 1.2, maxLev * 1.1, 1); // headroom

  const color = useMemo(
    () =>
      scaleLinear<string>()
        .domain([0, thresholdMin, thresholdGood])
        .range(["#C14953", "#F3C613", "var(--accent)"]) // red → gold → brand green
        .clamp(true),
    [thresholdMin, thresholdGood]
  );

  const scaleAngle = useMemo(
    () => scaleLinear().domain([0, domainMax]).range([0, 2 * Math.PI]).clamp(true),
    [domainMax]
  );

  const baseArc = arc().innerRadius(R1).outerRadius(R1 + stroke).startAngle(0).endAngle(2 * Math.PI);
  const ringBase = arc().innerRadius(R2).outerRadius(R2 + stroke).startAngle(0).endAngle(2 * Math.PI);

  return (
    <div className="panel">
      <div className="insights-grid">
        {items.map((it) => {
          const lev = it.bankUS <= 0 ? 0 : it.otherUS / it.bankUS; // “per $1” definition
          const a = scaleAngle(lev);
          const ringProg = arc().innerRadius(R2).outerRadius(R2 + stroke).startAngle(0).endAngle(a);

          return (
            <div className="ring-card" key={it.id}>
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`${it.name} leverage`}>
                <g transform={`translate(${size/2},${size/2})`}>
                  {/* inner ring: Bank's $1 (constant) */}
                  <path d={baseArc(undefined)!} fill="var(--panel-soft)" stroke="var(--ring)" />
                  {/* outer base */}
                  <path d={ringBase(undefined)!} fill="var(--panel-soft)" stroke="var(--ring)" />
                  {/* thresholds ticks on outer ring */}
                  {([thresholdMin, thresholdGood] as number[]).map((t,i) => {
                    const ang = scaleAngle(t) - Math.PI/2;
                    const x1 = Math.cos(ang) * (R2 + stroke + 2);
                    const y1 = Math.sin(ang) * (R2 + stroke + 2);
                    const x2 = Math.cos(ang) * (R2 + stroke + 8);
                    const y2 = Math.sin(ang) * (R2 + stroke + 8);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ring)"/>;
                  })}
                  {/* progress on outer ring */}
                  <path d={ringProg(undefined)!} fill={color(lev)} />
                  {/* center text */}
                  <text y={4} textAnchor="middle" fontWeight={700}>{lev.toFixed(1)}×</text>
                </g>
              </svg>

              <div className="ring-meta">
                <div className="ring-name" title={it.name}>{it.name}</div>
                <div className="caption">
                  Bank {formatCurrencyCompact(it.bankUS)} • Other {formatCurrencyCompact(it.otherUS)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* legend */}
      <div className="caption" style={{ marginTop: 8 }}>
        <span style={{ padding: "2px 6px", background:"#C14953", borderRadius:6, color:"#fff" }}>below {thresholdMin}×</span>
        &nbsp; <span style={{ padding: "2px 6px", background:"#F3C613", borderRadius:6 }}>≥ {thresholdMin}×</span>
        &nbsp; <span style={{ padding: "2px 6px", background:"var(--accent)", borderRadius:6, color:"#fff" }}>≥ {thresholdGood}×</span>
      </div>
    </div>
  );
}
