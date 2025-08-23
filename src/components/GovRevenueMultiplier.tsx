import React, { useMemo, useRef, useState, useLayoutEffect, useCallback } from "react";
import { scaleLinear } from "d3-scale";

/* --- types & utils (unchanged) --- */
export type GovRevBreakdown = { vat?: number; corporateTax?: number; duties?: number; other?: number; period?: string; currency?: "USD"; note?: string; };
export type GovRevItem = { id: string; name: string; bankUS: number; govRevenueUS: number; breakdown?: GovRevBreakdown; };
function fmtUSD(n: number){ return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",notation:"compact",maximumFractionDigits:1}).format(n); }
function pct(p:number,t:number){ if(!t||!isFinite(t)||t<=0) return "–"; return `${Math.round((p/t)*100)}%`; }

/* constants used inside the thermometer SVG */
const TRACK_Y = 12;     // top of the vertical track in viewBox
const TRACK_H = 112;    // height of the track in viewBox

export default function GovRevenueMultiplier({
  items, thresholdOk=2.0, thresholdGood=4.0, maxClamp=6.0, unit="$ per $1"
}: { items: GovRevItem[]; thresholdOk?: number; thresholdGood?: number; maxClamp?: number; unit?: string; }) {

  const data = items.map(x => ({ ...x, mult: x.bankUS<=0 ? 0 : x.govRevenueUS/x.bankUS }));
  const maxVal = Math.max(...data.map(d=>d.mult), thresholdGood, maxClamp);
  const yPct = useMemo(()=> scaleLinear().domain([0,maxVal]).range([0,100]), [maxVal]);

  // axis alignment state (measured in px relative to the shell top)
  const shellRef = useRef<HTMLDivElement|null>(null);
  const [axisTop, setAxisTop] = useState(0);
  const [axisH, setAxisH] = useState(180);

  // called by the FIRST tile once it renders (and on resize)
  const setAxisFromTrack = useCallback((trackRect: DOMRect) => {
    const shellTop = shellRef.current?.getBoundingClientRect().top ?? 0;
    setAxisTop(trackRect.top - shellTop);         // px from shell top to track top
    setAxisH(trackRect.height);                   // exact track height
  }, []);

  return (
    <div className="panel">
      <p className="caption">Estimated government revenue generated per US$1 invested ({unit}). Click or hover any thermometer for a tax breakdown.</p>

      {/* two-column shell */}
      <div className="grm-shell" ref={shellRef}>
        {/* sticky axis that uses the measured top/height */}
        <div className="grm-axisCol">
          <div className="grm-axis" style={{ marginTop: axisTop, height: axisH }} aria-hidden="true">
            <div className="grm-tick" style={{ bottom: `${(thresholdOk / maxVal) * 100}%` }}>
              <span className="grm-line grm-ok" /><span className="grm-label">≥ {thresholdOk.toFixed(1)}×</span>
            </div>
            <div className="grm-tick" style={{ bottom: `${(thresholdGood / maxVal) * 100}%` }}>
              <span className="grm-line grm-good" /><span className="grm-label">≥ {thresholdGood.toFixed(1)}×</span>
            </div>
            <div className="grm-top">{maxVal.toFixed(1)}×</div>
            <div className="grm-bottom">0×</div>
          </div>
        </div>

        {/* cards grid */}
        <div className="grm-cards">
          {data.map((d, i) => (
            <Tile
              key={d.id}
              d={d as any}
              hPct={Math.min(100, yPct(d.mult))}
              thresholdOk={thresholdOk}
              thresholdGood={thresholdGood}
              reportTrackRect={i===0 ? setAxisFromTrack : undefined}  /* only first tile reports */
            />
          ))}
        </div>
      </div>

      <div className="caption" style={{ marginTop: 8 }}>
        <span className="dot" style={{ background:"#C14953" }} /> below {thresholdOk.toFixed(1)}× &nbsp;|&nbsp;
        <span className="dot" style={{ background:"var(--accent-3)" }} /> ≥ {thresholdOk.toFixed(1)}× &nbsp;|&nbsp;
        <span className="dot" style={{ background:"var(--accent)" }} /> ≥ {thresholdGood.toFixed(1)}×
      </div>
    </div>
  );
}

/* ----- tile with measured track & popover (unchanged visually) ----- */
function Tile({
  d, hPct, thresholdOk, thresholdGood, reportTrackRect
}: {
  d: (GovRevItem & { mult:number }); hPct: number; thresholdOk: number; thresholdGood: number;
  reportTrackRect?: (r: DOMRect)=>void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<"right"|"left">("right");
  const wrapRef = useRef<HTMLDivElement|null>(null);
  const trackRef = useRef<SVGRectElement|null>(null);

  const color = d.mult>=thresholdGood ? "var(--accent)" : d.mult>=thresholdOk ? "var(--accent-3)" : "#C14953";
  const bd = d.breakdown ?? {}; const {vat=0, corporateTax=0, duties=0, other=0} = bd;
  const total = Math.max(d.govRevenueUS, vat+corporateTax+duties+other);

  // measure the rendered track rect and report it up (first tile only)
  useLayoutEffect(() => {
    if (!trackRef.current || !reportTrackRect) return;
    const observe = () => reportTrackRect(trackRef.current!.getBoundingClientRect());
    observe();
    const ro = new ResizeObserver(observe);
    ro.observe(trackRef.current);
    window.addEventListener("resize", observe);
    return () => { ro.disconnect(); window.removeEventListener("resize", observe); };
  }, [reportTrackRect]);

  // flip popover if tight to the right
  useLayoutEffect(() => {
    if (!open || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    setPos((window.innerWidth - r.right) < 280 ? "left" : "right");
  }, [open]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key==="Enter" || e.key===" "){ e.preventDefault(); setOpen(o=>!o); }
    if (e.key==="Escape") setOpen(false);
  };

  return (
    <div className="grm-card panel soft">
      <div className="grm-tile">
        <div
          ref={wrapRef}
          className="grm-svg-wrap"
          role="button" tabIndex={0} aria-haspopup="dialog"
          aria-expanded={open} aria-label={`Open breakdown for ${d.name}`}
          onClick={()=>setOpen(o=>!o)} onKeyDown={onKey} onMouseLeave={()=>setOpen(false)}
        >
          <svg viewBox="0 0 60 140" className="grm-svg" role="img" aria-label={`${d.name} multiplier ${d.mult.toFixed(1)}×`}>
            {/* track (ref used for axis alignment) */}
            <rect ref={trackRef} x="26" y={TRACK_Y} width="8" height={TRACK_H} rx="4" fill="var(--panel-soft)" stroke="var(--ring)"/>
            {/* fill */}
            <rect x="26" y={124 - (TRACK_H * hPct / 100)} width="8" height={(TRACK_H * hPct / 100)} rx="4" fill={color}/>
            {/* bulb */}
            <circle cx="30" cy="126" r="10" fill={color} stroke="var(--ring)"/>
          </svg>

          {open && (
            <div className={`popover ${pos}`} role="dialog" aria-label={`${d.name} revenue breakdown`}>
              <div className="popover-head">
                <strong>{d.name}</strong><span className="tag">{bd.period ?? ""}</span>
              </div>
              <div className="popover-body">
                <div className="kv"><span>Multiplier</span><strong>{d.mult.toFixed(2)}×</strong></div>
                <div className="kv"><span>Gov. revenue</span><strong>{fmtUSD(d.govRevenueUS)}</strong></div>
                <div className="kv"><span>Bank amount</span><strong>{fmtUSD(d.bankUS)}</strong></div>
                {(vat+corporateTax+duties+other)>0 && (<>
                  <hr/>
                  <div className="kv"><span>VAT</span><strong>{fmtUSD(vat)} <em className="muted">({pct(vat,total)})</em></strong></div>
                  <div className="kv"><span>Corporate tax</span><strong>{fmtUSD(corporateTax)} <em className="muted">({pct(corporateTax,total)})</em></strong></div>
                  <div className="kv"><span>Duties</span><strong>{fmtUSD(duties)} <em className="muted">({pct(duties,total)})</em></strong></div>
                  <div className="kv"><span>Other</span><strong>{fmtUSD(other)} <em className="muted">({pct(other,total)})</em></strong></div>
                </>)}
                {bd.note && <p className="caption" style={{marginTop:6}}>{bd.note}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="grm-meta">
          <div className="grm-name" title={d.name}>{d.name}</div>
          <div className="grm-values caption">
            <span className="grm-mult"><strong>{d.mult.toFixed(1)}×</strong></span>
            <span>Gov. rev: {fmtUSD(d.govRevenueUS)}</span>
            <span>Bank: {fmtUSD(d.bankUS)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
