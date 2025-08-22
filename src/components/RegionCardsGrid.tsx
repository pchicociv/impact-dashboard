import React, { useMemo } from "react";
import type { RegionImpact } from "../types";
import { formatCurrencyCompact, formatNumberCompact } from "../utils/format";

export default function RegionCardsGrid({ regions }: { regions: RegionImpact[] }) {
  const maxDisb  = useMemo(() => Math.max(...regions.map(r => r.totalDisbursementM)), [regions]);
  const maxTrade = useMemo(() => Math.max(...regions.map(r => Math.max(r.intraAfricanTradeUS, r.manufacturedExportsUS))), [regions]);
  const maxSME   = useMemo(() => Math.max(...regions.map(r => r.smesSupported)), [regions]);

  const pct = (v:number, max:number) => (max === 0 ? 0 : Math.round((v / max) * 100));

  return (
    <div className="region-grid">
      {regions.map(r => (
        <div className="panel region-card" key={r.region}>
          <h4 className="region-title">{r.region}</h4>

          {/* Disbursement ($M) */}
          <div className="region-row3">
            <span className="region-label">Disb ($M)</span>
            <div className="bar-frame">
              <div className="bar-fill"
                   style={{ ['--w' as any]: `${pct(r.totalDisbursementM, maxDisb)}%`, background: 'var(--accent)' }} />
            </div>
            <span className="region-value">{r.totalDisbursementM.toFixed(0)}M</span>
          </div>

          {/* Intra-Afr Trade (US$) */}
          <div className="region-row3">
            <span className="region-label">Intra-Afr Trade</span>
            <div className="bar-frame">
              <div className="bar-fill"
                   style={{ ['--w' as any]: `${pct(r.intraAfricanTradeUS, maxTrade)}%`, background: 'var(--accent-3)' }} />
            </div>
            <span className="region-value">{formatCurrencyCompact(r.intraAfricanTradeUS)}</span>
          </div>

          {/* Manufactured Exports (US$) */}
          <div className="region-row3">
            <span className="region-label">Mfg Exports</span>
            <div className="bar-frame">
              <div className="bar-fill"
                   style={{ ['--w' as any]: `${pct(r.manufacturedExportsUS, maxTrade)}%`, background: 'var(--accent-3)' }} />
            </div>
            <span className="region-value">{formatCurrencyCompact(r.manufacturedExportsUS)}</span>
          </div>

          {/* SMEs (count) */}
          <div className="region-row3">
            <span className="region-label">SMEs</span>
            <div className="bar-frame">
              <div className="bar-fill"
                   style={{ ['--w' as any]: `${pct(r.smesSupported, maxSME)}%`, background: 'var(--accent-2)' }} />
            </div>
            <span className="region-value">{formatNumberCompact(r.smesSupported)}</span>
          </div>

          <div className="region-footer">
            <span className="muted">{r.projects} projects</span>
            <strong className="jobs-emph">
              {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(r.jobsCreated)} jobs
            </strong>
          </div>
        </div>
      ))}
    </div>
  );
}
