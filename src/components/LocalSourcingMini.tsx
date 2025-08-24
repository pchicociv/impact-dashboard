import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import { area, curveMonotoneX } from "d3-shape";
import { scaleLinear } from "d3-scale";
import type { LocalContentPoint } from "../types";

/** Tiny 100% ribbon with last-value chips; fully responsive to its container. */
export default function LocalSourcingMini({
  data,
  height = 64,
  title = "Local content (share)",
}: {
  data: LocalContentPoint[];
  height?: number;
  title?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(240);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onResize = () => setW(el.clientWidth);
    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    window.addEventListener("resize", onResize);
    return () => { ro.disconnect(); window.removeEventListener("resize", onResize); };
  }, []);

  const padX = 6;
  const innerW = Math.max(0, w - padX * 2);
  const innerH = Math.max(0, height - 22); // leave room for title row

  const n = data.length;
  const x = useMemo(() => scaleLinear().domain([0, Math.max(0, n - 1)]).range([0, innerW]), [n, innerW]);
  const y = useMemo(() => scaleLinear().domain([0, 1]).range([innerH, 0]), [innerH]);

  const shares = data.map(d => {
    const total = d.domesticUS + d.importedUS;
    return total ? d.domesticUS / total : 0;
  });
  const lastShare = shares[shares.length - 1] ?? 0;

  const domestic100 = useMemo(() => {
    const pts = data.map((d,i) => ({ i, s: shares[i] }));
    return area<{i:number,s:number}>()
      .x(p => x(p.i))
      .y0(y(0))
      .y1(p => y(p.s))
      .curve(curveMonotoneX)(pts) || undefined;
  }, [data, shares, x, y]);

  const imported100 = useMemo(() => {
    const pts = data.map((d,i) => ({ i, s: 1 - shares[i] }));
    return area<{i:number,s:number}>()
      .x(p => x(p.i))
      .y0(p => y(1 - (1 - p.s))) // y0 to the domestic top
      .y1(() => y(1))
      .curve(curveMonotoneX)(pts) || undefined;
  }, [data, shares, x, y]);

  return (
    <div className="panel soft" role="figure" aria-label="Local vs imported share" ref={wrapRef}>
      <div className="hstack" style={{ justifyContent: "space-between", marginBottom: 6 }}>
        <div className="caption">{title}</div>
        <div className="legend-col caption">
          <span className="legend-chip"><i className="legend-dot domestic" /> {Math.round(lastShare*100)}%</span>
          <span className="legend-chip"><i className="legend-dot imported" /> {Math.round((1-lastShare)*100)}%</span>
        </div>
      </div>
      <div className="chart-clip" style={{ marginInline: padX }}>
        <svg width={innerW} height={innerH} preserveAspectRatio="none">
          <g>
            <path d={imported100} fill="var(--gold-500)" opacity={0.65} />
            <path d={domestic100} fill="var(--teal-700)" opacity={0.85} />
          </g>
        </svg>
      </div>
    </div>
  );
}
