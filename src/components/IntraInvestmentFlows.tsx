// src/components/IntraInvestmentFlows.tsx
import React, {
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  useId,
  useEffect,
} from "react";
import type { FlowEdge, RegionName } from "../types";
import { formatCurrencyCompact } from "../utils/format";

/** Resize observer hook (same pattern used elsewhere) */
function useWidth<T extends HTMLElement>(initial = 360) {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(initial);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) =>
      setW(entries[0].contentRect.width)
    );
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, w };
}

type Props = {
  flows: FlowEdge[];
  /** Optional explicit region order around the ring */
  regionsOrder?: RegionName[];
  /** Initial minimum threshold (US$) to render a flow */
  minThresholdUS?: number;
  className?: string;
  /** optional: arrows on ends (off by default) */
  showArrows?: boolean;
};

const DEFAULT_REGIONS: RegionName[] = [
  "West Africa",
  "North Africa",
  "Central Africa",
  "East Africa",
  "Southern Africa",
];

export default function IntraInvestmentFlows({
  flows,
  regionsOrder = DEFAULT_REGIONS,
  minThresholdUS,
  className,
  showArrows = false,
}: Props) {
  // ---------- Stats ----------
  const stats = useMemo(() => {
    const total = flows.reduce((s, f) => s + f.amountUS, 0);
    const max = flows.reduce((m, f) => Math.max(m, f.amountUS), 0);
    return { total, max };
  }, [flows]);

  const [threshold, setThreshold] = useState(
    minThresholdUS ?? Math.round((stats.max || 0) * 0.08)
  );
  useEffect(() => {
    if (stats.max > 0 && threshold > stats.max) {
      setThreshold(Math.round(stats.max * 0.5));
    }
  }, [stats.max, threshold]);

  // ---------- Focus / filter ----------
  const [hoverRegion, setHoverRegion] = useState<RegionName | null>(null);
  const [pinnedRegion, setPinnedRegion] = useState<RegionName | null>(null);
  const focusRegion = pinnedRegion ?? hoverRegion ?? null;
  const [hideOthers, setHideOthers] = useState(false);

  const visible = useMemo(
    () =>
      flows.filter(
        (f) => f.amountUS >= threshold && f.fromRegion !== f.toRegion
      ),
    [flows, threshold]
  );

  const shown = useMemo(() => {
    const arr =
      !focusRegion || !hideOthers
        ? visible.slice()
        : visible.filter(
            (f) => f.fromRegion === focusRegion || f.toRegion === focusRegion
          );
    // draw thicker links first so thin ones sit on top for legibility
    return arr.sort((a, b) => b.amountUS - a.amountUS);
  }, [visible, focusRegion, hideOthers]);

  // ---------- Layout (adds margin so labels don't clip) ----------
  const { ref, w } = useWidth<HTMLDivElement>(520);
  const inner = Math.max(320, Math.min(600, w));   // core drawing size (ring)
  const M = 56;                                    // outer margin to avoid clipping
  const size = inner + M * 2;                      // total SVG size
  const R = inner / 2 - 36;                        // ring radius
  const cx = M + inner / 2;
  const cy = M + inner / 2;

  const regionAngles = useMemo(() => {
    const order = regionsOrder.filter((r, i, a) => a.indexOf(r) === i);
    const step = (Math.PI * 2) / order.length;
    return new Map(order.map((r, i) => [r, -Math.PI / 2 + i * step]));
  }, [regionsOrder]);

  // Roving tabindex (keyboard)
  const [focusIdx, setFocusIdx] = useState(0);
  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const regionList = regionsOrder;

  const rawId = useId();
  const uid = useMemo(
    () => `flows-${String(rawId).replace(/[^a-zA-Z0-9_-]/g, "-")}`,
    [rawId]
  );

  // ---- Helpers ----
  const polar = (a: number, r = R): [number, number] => [
    cx + Math.cos(a) * r,
    cy + Math.sin(a) * r,
  ];

  // Mid-bundle control point (span-aware so short spans don't cram labels)
  const baseControl = (a1: number, a2: number, bundle = 0.82) => {
    // tighter bundle for long spans; looser for short spans to reduce overlap near ring
    let da = a2 - a1;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    const span = Math.abs(da); // 0..PI
    const dyn = 0.68 + 0.22 * (span / Math.PI); // 0.68..0.9
    const mid = a1 + da / 2;
    const cR = R * (1 - 0.30);
    const [cxm, cym] = polar(mid, cR);
    const bx = cx + (cxm - cx) * (bundle ?? dyn);
    const by = cy + (cym - cy) * (bundle ?? dyn);
    return { bx, by };
  };

  // Make a non-overlapping curve for a directed link.
  // If side ≠ 0 (pair is bidirectional), offset endpoints and control point.
  const linkPathSeparated = (
    a1: number,
    a2: number,
    side: number, // -1, 0, +1
    thick: number
  ) => {
    const deltaDeg = 3 + Math.min(8, thick * 0.5); // degrees
    const deltaA = (Math.PI / 180) * (side !== 0 ? deltaDeg : 0);

    const a1o = a1 - side * deltaA;
    const a2o = a2 + side * deltaA;

    const [x1, y1] = polar(a1o);
    const [x2, y2] = polar(a2o);

    const { bx, by } = baseControl(a1o, a2o);

    // Normal to chord for control separation
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const sepPx = (4 + thick * 0.35) * side; // shifted control point
    const bxo = bx + nx * sepPx;
    const byo = by + ny * sepPx;

    return `M${x1},${y1} Q${bxo},${byo} ${x2},${y2}`;
  };

  const amountScale = (amt: number) => {
    if (stats.max <= 0) return 2;
    const denom = Math.max(1, stats.max - threshold);
    const t = Math.max(0, Math.min(1, (amt - threshold) / denom));
    return 2 + Math.pow(t, 0.6) * 10; // 2–12 px
  };

  const dimmed = (r?: RegionName) => (focusRegion ? r !== focusRegion : false);

  const onKeyRegionsButton = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    i: number
  ) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIdx((idx) => {
        const next = (idx + 1) % regionList.length;
        setTimeout(() => btnRefs.current[next]?.focus(), 0);
        return next;
      });
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIdx((idx) => {
        const prev = (idx - 1 + regionList.length) % regionList.length;
        setTimeout(() => btnRefs.current[prev]?.focus(), 0);
        return prev;
      });
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const r = regionList[i];
      setPinnedRegion((prev) => (prev === r ? null : r));
    } else if (e.key === "Escape") {
      setPinnedRegion(null);
    }
  };

  // ---------- Region totals (thresholded) ----------
  const totalsByRegion = useMemo(() => {
    const map = new Map<RegionName, { inUS: number; outUS: number }>();
    regionList.forEach((r) => map.set(r, { inUS: 0, outUS: 0 }));
    visible.forEach((f) => {
      map.get(f.fromRegion)!.outUS += f.amountUS;
      map.get(f.toRegion)!.inUS += f.amountUS;
    });
    return map;
  }, [visible, regionList]);

  // Precompute opposite-direction pairs to offset them
  const pairSide = useMemo(() => {
    const key = (a: string, b: string) => `${a}→${b}`;
    const m = new Map<string, number>();
    const exists = new Set<string>();
    visible.forEach((f) => exists.add(key(f.fromRegion, f.toRegion)));
    regionList.forEach((a) =>
      regionList.forEach((b) => {
        if (a === b) return;
        const ab = exists.has(key(a, b));
        const ba = exists.has(key(b, a));
        if (ab && ba) {
          const s = a < b ? -1 : +1;
          m.set(key(a, b), s);
          m.set(key(b, a), -s);
        } else if (ab) {
          m.set(key(a, b), 0);
        }
      })
    );
    return (a: RegionName, b: RegionName) => m.get(key(a, b)) ?? 0;
  }, [visible, regionList]);

  // ---------- UI ----------
  return (
    // ensure white background panel like the rest of the dashboard
    <div className={`panel ${className ?? ""}`}>
      {/* Controls row — flexible + wraps on small widths */}
      <div
        className="row"
        style={{
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {/* tiny pictogram legend on a soft pill */}
        <div
          className="panel soft"
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: "6px 10px",
          }}
        >
          <svg width="44" height="12" aria-hidden="true">
            <path
              d="M2,10 Q22,-8 42,10"
              fill="none"
              stroke="var(--accent-2)"
              strokeWidth={4}
              opacity={0.9}
            />
          </svg>
          <span className="caption">Flow ~ thickness</span>
          <span className="caption">
            • Two arcs = opposite directions • Dot marks destination
          </span>
        </div>

        {/* Region badges */}
        <div className="hstack" style={{ gap: 8, flexWrap: "wrap" }}>
          {regionList.map((r, i) => {
            const selected = focusRegion === r;
            const t = totalsByRegion.get(r);
            return (
              <button
                key={r}
                className="badge"
                aria-pressed={selected}
                data-selected={selected || undefined}
                tabIndex={i === (focusIdx % regionList.length) ? 0 : -1}
                ref={(el) => (btnRefs.current[i] = el)}
                onFocus={() => setFocusIdx(i)}
                onKeyDown={(e) => onKeyRegionsButton(e, i)}
                onMouseEnter={() => setHoverRegion(r)}
                onMouseLeave={() => setHoverRegion(null)}
                onClick={() => setPinnedRegion((prev) => (prev === r ? null : r))}
                title={`${r} — Out: ${formatCurrencyCompact(
                  t?.outUS || 0
                )} · In: ${formatCurrencyCompact(t?.inUS || 0)}`}
              >
                {r}
                <span style={{ marginLeft: 8, opacity: 0.7 }} className="caption">
                  ⭑ out {formatCurrencyCompact(t?.outUS || 0)} • in{" "}
                  {formatCurrencyCompact(t?.inUS || 0)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Totals (kept compact) */}
        <div className="hstack" style={{ gap: 8, marginLeft: "auto" }}>
          <span className="caption">Total shown:</span>
          <strong className="caption">
            {formatCurrencyCompact(shown.reduce((s, f) => s + f.amountUS, 0))}
          </strong>
          <span className="caption">Max link:</span>
          <strong className="caption">{formatCurrencyCompact(stats.max)}</strong>
          <span className="caption">• Links:</span>
          <strong className="caption">{shown.length}</strong>
        </div>

        {/* Slider cluster (now consistent and not overlapping) */}
        <div className="hstack" style={{ gap: 10, marginLeft: 8 }}>
          <label className="caption" htmlFor={`minflow-${uid}`}>
            Min flow
          </label>
          <input
            id={`minflow-${uid}`}
            type="range"
            min={0}
            max={Math.max(1, Math.round(stats.max))}
            value={Math.min(threshold, Math.round(stats.max))}
            onChange={(e) => setThreshold(Number(e.target.value))}
            step={Math.max(1, Math.round(stats.max / 80))}
            aria-valuemin={0}
            aria-valuemax={Math.round(stats.max)}
            aria-valuenow={threshold}
            aria-label="Minimum flow threshold"
            style={{ width: 180 }}
          />
          <span className="caption">{formatCurrencyCompact(threshold)}</span>

          <button
            className="badge"
            onClick={() => {
              setPinnedRegion(null);
              setHoverRegion(null);
            }}
            disabled={!focusRegion}
            aria-label="Clear focus region"
            title="Clear focus"
          >
            Clear focus
          </button>

          <label className="hstack caption" style={{ gap: 6 }}>
            <input
              type="checkbox"
              checked={hideOthers}
              onChange={(e) => setHideOthers(e.target.checked)}
              aria-label="Only show focused region"
            />
            dim rest
          </label>
        </div>
      </div>

      {/* Chart */}
      <div ref={ref} style={{ width: "100%", overflow: "hidden" }}>
        <svg
          width={size}
          height={size}
          role="img"
          aria-label="Chord-like flow between regions"
        >
          {showArrows && (
            <defs>
              <marker
                id={`arrow-${uid}`}
                viewBox="0 0 10 10"
                refX={9}
                refY={5}
                markerWidth={9}
                markerHeight={9}
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path d="M0,0 L10,5 L0,10 z" fill="var(--accent-2)" />
              </marker>
            </defs>
          )}

          {/* guide ring UNDER everything */}
          <circle
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke="var(--ring)"
            strokeDasharray="4 6"
          />

          {/* links */}
          <g>
            {shown.map((f, idx) => {
              const a1 = regionAngles.get(f.fromRegion)!;
              const a2 = regionAngles.get(f.toRegion)!;
              const thick = amountScale(f.amountUS);
              const side = pairSide(f.fromRegion, f.toRegion);
              const isDim =
                !!focusRegion &&
                f.fromRegion !== focusRegion &&
                f.toRegion !== focusRegion;

              const pathD = linkPathSeparated(a1, a2, side, thick);

              // destination dot position (slightly inside ring)
              const [dx, dy] = polar(a2, R - 2);

              return (
                <g key={idx} aria-label={`${f.fromRegion} to ${f.toRegion}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="var(--accent-2)"
                    strokeWidth={thick}
                    opacity={isDim ? 0.16 : 0.85}
                    markerEnd={showArrows ? `url(#arrow-${uid})` : undefined}
                    onMouseEnter={() => {
                      if (!pinnedRegion) setHoverRegion(f.toRegion);
                    }}
                    onMouseLeave={() => {
                      if (!pinnedRegion) setHoverRegion(null);
                    }}
                  >
                    <title>
                      {`${f.fromRegion} → ${f.toRegion}: ${formatCurrencyCompact(
                        f.amountUS
                      )}`}
                    </title>
                  </path>

                  {/* destination dot for direction cue (used when arrows are off) */}
                  {!showArrows && (
                    <circle
                      cx={dx}
                      cy={dy}
                      r={Math.max(1.5, Math.min(2.8, thick * 0.28))}
                      fill="var(--accent-2)"
                      opacity={isDim ? 0.28 : 0.98}
                    >
                      <title>{`${f.fromRegion} → ${f.toRegion}: ${formatCurrencyCompact(
                        f.amountUS
                      )}`}</title>
                    </circle>
                  )}
                </g>
              );
            })}
          </g>

          {/* region ticks / labels and YELLOW region dots ON TOP */}
          <g>
            {regionList.map((r) => {
              const a = regionAngles.get(r)!;
              const [x, y] = polar(a, R);
              const [tx, ty] = polar(a, R + 14);
              const [lx, ly] = polar(a, R + 28);
              const anchor =
                Math.cos(a) > 0.2 ? "start" : Math.cos(a) < -0.2 ? "end" : "middle";
              const isDim = dimmed(r);
              const t = totalsByRegion.get(r);

              return (
                <g key={r} aria-label={`${r} label`}>
                  {/* small yellow dot at region anchor */}
                  <circle
                    cx={x}
                    cy={y}
                    r={3.5}
                    fill="var(--region-dot, #FACC15)" // fallback yellow if var missing
                    stroke="var(--ink)"
                    strokeOpacity={0.2}
                  />
                  <line
                    x1={x}
                    y1={y}
                    x2={tx}
                    y2={ty}
                    stroke="var(--ink)"
                    strokeOpacity={isDim ? 0.25 : 0.45}
                  />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor={anchor as any}
                    className="caption"
                    aria-hidden="true"
                    style={{ fill: "var(--ink)", opacity: isDim ? 0.6 : 1 }}
                  >
                    {r}
                  </text>
                  <text
                    x={lx}
                    y={ly + 12}
                    textAnchor={anchor as any}
                    className="caption"
                    style={{ fill: "var(--muted)", opacity: isDim ? 0.6 : 1 }}
                  >
                    out {formatCurrencyCompact(t?.outUS || 0)} · in{" "}
                    {formatCurrencyCompact(t?.inUS || 0)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
