import React from "react";
import { formatCurrencyCompact } from "../utils/format";

type Item = { id: string; name: string; intraUS: number; totalUS: number };

export default function IntraAfricanShareMeter({ items }: { items: Item[] }) {
  return (
    <div className="panel">
      <h3 className="title" style={{ marginBottom: 12 }}>Intra-African Trade Share</h3>
      <div className="share-grid">
        {items.map(it => {
          const total = it.totalUS || 0;
          const intra = Math.min(it.intraUS, total);
          const extra = Math.max(0, total - intra);
          const pct = total === 0 ? 0 : Math.round((intra / total) * 100);
          return (
            <div className="share-card" key={it.id}>
              <div className="share-head">
                <strong className="share-name" title={it.name}>{it.name}</strong>
                <span className="badge" title="Intra-African Share">{pct}%</span>
              </div>

              <div className="share-bar">
                <div className="share-intra" style={{ width: `${(intra/Math.max(1,total))*100}%` }} />
                <div className="share-extra" style={{ width: `${(extra/Math.max(1,total))*100}%` }} />
              </div>

              <div className="share-vals caption">
                <span>Intra: {formatCurrencyCompact(intra)}</span>
                <span>Total: {formatCurrencyCompact(total)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="caption" style={{ marginTop: 6 }}>
        <span className="dot" style={{ background:"var(--accent-3)" }} /> Intra-African &nbsp;|&nbsp;
        <span className="dot" style={{ background:"var(--panel-soft)", border:"1px solid var(--ring)" }} /> Extra-African
      </div>
    </div>
  );
}
