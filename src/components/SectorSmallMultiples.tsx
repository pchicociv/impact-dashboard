import React from "react";
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";
import { formatNumberCompact } from "../utils/format";
import type { SectorImpact } from "../types";

export default function SectorSmallMultiples({ sectors }: { sectors: SectorImpact[] }) {
  const maxDisb = max(sectors, s => s.totalDisbursementM) ?? 0;
  const x = scaleLinear().domain([0, maxDisb]).range([0, 180]);

  return (
    <div className="grid cols-3">
      {sectors.map(s => {
        const jobsPerM = s.totalDisbursementM === 0 ? 0 : s.jobsCreated / s.totalDisbursementM;
        const projectsDots = Math.min(s.numberOfProjects, 40); // cap for display
        return (
          <div className="panel" key={s.sector}>
            <div className="hstack" style={{ justifyContent: "space-between" }}>
              <strong>{s.sector}</strong>
              <span className="caption">{s.numberOfProjects} projects</span>
            </div>

            <div style={{ marginTop: 8 }}>
              <div className="caption">Total Disbursement ($M)</div>
              <div style={{ width: 200, height: 12, background: "#0f1420", borderRadius: 6, border: "1px solid var(--ring)" }}>
                <div style={{ width: x(s.totalDisbursementM), height: 12, background: "var(--accent)" }} />
              </div>
              <div className="caption">{s.totalDisbursementM.toFixed(0)}M</div>
            </div>

            <div style={{ marginTop: 8 }}>
              <div className="caption">Projects (unit strip)</div>
              <div className="hstack" style={{ flexWrap: "wrap", gap: 4 }}>
                {Array.from({ length: projectsDots }).map((_, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: "var(--accent-2)" }} />
                ))}
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <div className="caption">Jobs per $1M</div>
              <div className="hstack" role="figure" aria-label="Jobs per million US$">
                <strong style={{ color: "var(--accent-4)" }}>{formatNumberCompact(jobsPerM)}</strong>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
