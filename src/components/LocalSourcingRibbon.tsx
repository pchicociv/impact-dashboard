import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import { area, line, curveMonotoneX } from "d3-shape";
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";
import { formatCurrencyCompact } from "../utils/format";
import type { LocalContentPoint } from "../types";

export default function LocalSourcingRibbon({
  data,
  height = 180,
  stackedBelowWidth = 420,
  ariaLabel = "Domestic vs Imported inputs over time",
}: {
  data: LocalContentPoint[];
  height?: number;
  stackedBelowWidth?: number;
  ariaLabel?: string;
}) {
  const sorted = useMemo(() => data.slice(), [data]);
  const totals = useMemo(() => sorted.map(d => d.domesticUS + d.importedUS), [sorted]);
  const maxTotal = useMemo(() => max(totals) ?? 0, [totals]);
  const last = sorted[sorted.length - 1];
  const lastShareDomestic = last ? (last.domesticUS / (last.domesticUS + last.importedUS || 1)) : 0;

  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  useLayoutEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const onResize = () => setW(el.clientWidth);
    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    window.addEventListener("resize", onResize);
    return () => { ro.disconnect(); window.removeEventListener("resize", onResize); };
  }, []);

  const n = sorted.length;
  const padL = 10, padR = 10, padT = 8, padB = 24;
  const innerW = Math.max(0, w - padL - padR);
  const innerH = Math.max(0, height - padT - padB);
  const isStackedBars = w < stackedBelowWidth;

  // --- NEW: compute step, bar width, and edge padding so the last point is never clipped
  const estStep = innerW / Math.max(1, n - 1);
  const bw = Math.max(6, Math.min(28, estStep * 0.7)); // sensible bar width
  const edgePad = isStackedBars ? Math.ceil(bw / 2) + 2 : 8; // keep shapes inside the clip
  const drawableW = Math.max(0, innerW - edgePad * 2);

  const x = useMemo(
    () => scaleLinear().domain([0, Math.max(0, n - 1)]).range([edgePad, edgePad + drawableW]),
    [n, edgePad, drawableW]
  );
  const y = useMemo(
    () => scaleLinear().domain([0, maxTotal]).nice().range([innerH, 0]),
    [maxTotal, innerH]
  );

  const [hoverI, setHoverI] = useState<number | null>(null);
  const hover = hoverI == null ? null : sorted[hoverI];

  const domesticArea = useMemo(() => {
    const a = area<[number, number]>()
      .x((d, i) => x(i))
      .y0(y(0))
      .y1((d, i) => y(sorted[i].domesticUS))
      .curve(curveMonotoneX);
    return a(sorted.map((d,i) => [i, d.domesticUS] as [number, number])) || undefined;
  }, [sorted, x, y]);

  const importedArea = useMemo(() => {
    const a = area<[number, number]>()
      .x((d, i) => x(i))
      .y0((d,i) => y(sorted[i].domesticUS))
      .y1((d,i) => y(sorted[i].domesticUS + sorted[i].importedUS))
      .curve(curveMonotoneX);
    return a(sorted.map((d,i) => [i, d.importedUS] as [number, number])) || undefined;
  }, [sorted, x, y]);

  const splitLine = useMemo(() => {
    const l = line<[number, number]>()
      .x((d, i) => x(i))
      .y((d,i) => y(sorted[i].domesticUS))
      .curve(curveMonotoneX);
    return l(sorted.map((d,i) => [i, d.domesticUS] as [number, number])) || undefined;
  }, [sorted, x, y]);

  function nearestIndex(px: number){
    // px is relative to the <rect> inside the inner group
    const rx = px - edgePad;
    const step = drawableW / Math.max(1, n - 1);
    const i = Math.round(rx / step);
    return Math.max(0, Math.min(n - 1, i));
  }

  // ...imports and calculations above stay exactly as you have them...

return (
  <div className="panel" ref={wrapRef}>
    {/* Legend (unchanged) */}
    <div className="legend" style={{ justifyContent: "space-between", marginBottom: 6 }}>
      <div className="legend-col"><span className="legend-chip"><i className="legend-dot domestic" /> Domestic</span><span className="legend-chip"><i className="legend-dot imported" /> Imported</span></div>
      <div className="legend-col caption"><span className="legend-chip"><i className="legend-dot domestic" /> {Math.round(lastShareDomestic*100)}%</span><span className="legend-chip"><i className="legend-dot imported" /> {Math.round((1-lastShareDomestic)*100)}%</span></div>
    </div>

    <div role="figure" aria-label={ariaLabel} style={{ position: "relative" }}>
      <svg width={w} height={height}>
        <g transform={`translate(${padL},${padT})`}>
          {/* Clip ONLY the drawings, not labels/tooltips */}
          <defs>
            <clipPath id="localRibbonClip" clipPathUnits="userSpaceOnUse">
              <rect x={0} y={0} width={innerW} height={innerH} rx={8} ry={8} />
            </clipPath>
          </defs>

          <g clipPath="url(#localRibbonClip)">
            {isStackedBars ? (
              <>
                {sorted.map((d, i) => {
                  const total = d.domesticUS + d.importedUS;
                  const hDom = total ? (d.domesticUS/total)*innerH : 0;
                  const hImp = innerH - hDom;
                  const bw = Math.max(6, Math.min(28, (innerW / Math.max(1, n-1)) * 0.7));
                  const edgePad = Math.ceil(bw/2) + 2;
                  const drawableW = Math.max(0, innerW - edgePad*2);
                  const xScaled = scaleLinear().domain([0, Math.max(0, n-1)]).range([edgePad, edgePad + drawableW]);
                  const bx = xScaled(i) - bw/2;
                  return (
                    <g key={i}>
                      <rect x={bx} y={innerH - hDom} width={bw} height={hDom} fill="var(--teal-700)" opacity={0.85} />
                      <rect x={bx} y={innerH - hDom - hImp} width={bw} height={hImp} fill="var(--gold-500)" opacity={0.65} />
                    </g>
                  );
                })}
              </>
            ) : (
              <>
                <path d={importedArea} fill="var(--gold-500)" opacity={0.65} />
                <path d={domesticArea} fill="var(--teal-700)" opacity={0.85} />
                <path d={splitLine} fill="none" stroke="rgba(0,0,0,.25)" strokeWidth={1.5} />
              </>
            )}
          </g>

          {/* x labels (outside the clip, so not cropped) */}
          {n > 0 && (
            <g transform={`translate(0, ${innerH + 16})`} className="caption" aria-hidden="true">
              <text x={x(0)} textAnchor="start">{String(sorted[0].t)}</text>
              <text x={x(Math.floor((n-1)/2))} textAnchor="middle">{String(sorted[Math.floor((n-1)/2)].t)}</text>
              <text x={x(n-1)} textAnchor="end" dx={-2}>{String(sorted[n-1].t)}</text>
            </g>
          )}

          {/* hover capture (not clipped) */}
          <rect
            x={0} y={0} width={innerW} height={innerH} fill="transparent"
            onMouseMove={(e) => {
              const bbox = (e.currentTarget as SVGRectElement).getBoundingClientRect();
              const rx = e.clientX - bbox.left;
              const step = (innerW - (edgePad*2)) / Math.max(1, n - 1);
              const i = Math.max(0, Math.min(n-1, Math.round((rx - edgePad)/step)));
              setHoverI(i);
            }}
            onMouseLeave={() => setHoverI(null)}
          />

          {/* hover indicator (drawn on top, not clipped) */}
          {hover != null && (
            <g transform={`translate(${x(hoverI!)},0)`}>
              <line y1={0} y2={innerH} stroke="var(--ring)" />
              <circle cy={y(hover.domesticUS)} r={3.5} fill="var(--ink)" />
            </g>
          )}
        </g>
      </svg>

      {/* Tooltip remains outside any clip */}
    {hover != null && (
  <div
    className="popover popover--chart"
    style={{
      left: Math.min(w - 260, Math.max(6, 10 + x(hoverI!) + 8)),
      top: 8,
      // harden against theme overrides
      zIndex: 50,
      color: "var(--ink)",
      minWidth: 180,
      padding: 8,
      pointerEvents: "none",
    }}
  >
    <div className="caption" style={{ marginBottom: 6, color: "var(--ink)" }}>
      <strong>{String(hover.t)}</strong>
    </div>

    <div style={{ display: "grid", gap: 6 }}>
      <div className="hstack" style={{ gap: 8, alignItems: "center", whiteSpace: "nowrap" }}>
        <i className="legend-dot domestic" />
        <span>Domestic</span>
        <strong style={{ marginLeft: "auto" }}>{formatCurrencyCompact(hover.domesticUS)}</strong>
      </div>
      <div className="hstack" style={{ gap: 8, alignItems: "center", whiteSpace: "nowrap" }}>
        <i className="legend-dot imported" />
        <span>Imported</span>
        <strong style={{ marginLeft: "auto" }}>{formatCurrencyCompact(hover.importedUS)}</strong>
      </div>
      <div className="caption" style={{ marginTop: 4 }}>
        Domestic share:&nbsp;
        <strong>
          {Math.round(
            (hover.domesticUS / ((hover.domesticUS + hover.importedUS) || 1)) * 100
          )}%
        </strong>
      </div>
    </div>
  </div>
)}

    </div>
  </div>
);
}
