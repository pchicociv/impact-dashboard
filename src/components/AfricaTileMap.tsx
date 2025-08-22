import React from "react";
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";
import { formatCurrencyCompact, formatNumberCompact } from "../utils/format";
import type { RegionImpact } from "../types";

const layout = [
  { region: "West Africa", x: 0, y: 1 },
  { region: "North Africa", x: 1, y: 0 },
  { region: "Central Africa", x: 1, y: 1 },
  { region: "East Africa", x: 2, y: 1 },
  { region: "Southern Africa", x: 1, y: 2 }
] as const;

export default function AfricaTileMap({ regions }: { regions: RegionImpact[] }) {
  const W = 320, H = 240, tile = 100, gap = 10;

  const maxDisb = max(regions, r => r.totalDisbursementM) ?? 0;
  const maxTrade = max(regions, r => Math.max(r.intraAfricanTradeUS, r.manufacturedExportsUS)) ?? 0;
  const maxSME = max(regions, r => r.smesSupported) ?? 0;

  const xBar = scaleLinear().domain([0, maxDisb]).range([0, tile - 20]);
  const xSlim = scaleLinear().domain([0, maxTrade]).range([0, tile - 20]);
  const xSme = scaleLinear().domain([0, maxSME]).range([0, tile - 20]);

  return (
    <div className="panel" style={{ width: W }}>
      <svg width={W} height={H} role="img" aria-label="Impact by Region">
        {layout.map(l => {
          const r = regions.find(rr => rr.region === l.region);
          if (!r) return null;

          const X = l.x * (tile + gap), Y = l.y * (tile + gap);
          return (
            <g key={l.region} transform={`translate(${X},${Y})`}>
              <rect width={tile} height={tile} rx={8} fill="#0f1420" stroke="var(--ring)"></rect>
              <text x={8} y={16} fontSize={12} fill="var(--ink)">{r.region}</text>

              {/* Disbursement bar */}
              <text x={8} y={32} fontSize={11} fill="var(--muted)">Disb ($M)</text>
              <rect x={8} y={38} width={xBar(r.totalDisbursementM)} height={10} fill="var(--accent)"></rect>

              {/* Slim bars */}
              <text x={8} y={58} fontSize={11} fill="var(--muted)">Intra-Afr Trade</text>
              <rect x={8} y={64} width={xSlim(r.intraAfricanTradeUS)} height={6} fill="var(--accent-3)"></rect>

              <text x={8} y={78} fontSize={11} fill="var(--muted)">Manufactured Exports</text>
              <rect x={8} y={84} width={xSlim(r.manufacturedExportsUS)} height={6} fill="var(--accent-3)"></rect>

              <text x={8} y={98} fontSize={11} fill="var(--muted)">SMEs</text>
              <rect x={8} y={104} width={xSme(r.smesSupported)} height={6} fill="var(--accent-2)"></rect>

              <text x={8} y={122} fontSize={11} fill="var(--muted)">{r.projects} projects</text>
              <text x={tile - 8} y={122} fontSize={11} fill="var(--accent-4)" textAnchor="end">
                {formatNumberCompact(r.jobsCreated)} jobs
              </text>

              {/* tooltips via <title> */}
              <title>
                {`${r.region}\nDisbursement: $${r.totalDisbursementM.toFixed(0)}M\nIntra-African Trade: ${formatCurrencyCompact(r.intraAfricanTradeUS)}\nManufactured Exports: ${formatCurrencyCompact(r.manufacturedExportsUS)}\nSMEs: ${r.smesSupported}\nJobs: ${r.jobsCreated}`}
              </title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
