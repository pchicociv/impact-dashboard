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
  const focusRegion: RegionName | null = pinnedRegion ?? hoverRegion;
  const [hideOthers, setHideOthers] = useState(true);

  const visible = useMemo(
    () =>
      flows.filter(
        (f) => f.amountUS >= threshold && f.fromRegion !== f.toRegion
      ),
    [flows, threshold]
  );

  const shown = useMemo(() => {
    if (!focusRegion || !hideOthers) return visible;
    return visible.filter(
      (f) => f.fromRegion === focusRegion || f.toRegion === focusRegion
    );
  }, [visible, focusRegion, hideOthers]);

  // ---------- Layout ----------
  const { ref, w } = useWidth<HTMLDivElement>(420);
  const size = Math.max(280, Math.min(560, w));
  const R = size / 2 - 36;
  const cx = size / 2;
  const cy = size / 2;

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

  // ---------- Geometry helpers ----------
  const polar = (ang: number, radius = R) => [
    cx + Math.cos(ang) * radius,
    cy + Math.sin(ang) * radius,
  ] as const;

  // inward-bundled control point (no separation yet)
  const baseControl = (a1: number, a2: number, bundle = 0.82) => {
    let da = a2 - a1;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    const mid = a1 + da / 2;
    const cR = R * (1 - 0.28);
    const [cxm, cym] = polar(mid, cR);
    const bx = cx + (cxm - cx) * bundle;
    const by = cy + (cym - cy) * bundle;
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
    const deltaDeg = 3 + Math.min(7, thick * 0.45); // degrees
    const deltaA = (Math.PI / 180) * (side !== 0 ? deltaDeg : 0);

    const a1o = a1 - side * deltaA;
    const a2o = a2 + side * deltaA;

    const [x1, y1] = polar(a1o);
    const [x2, y2] = polar(a2o);

    const { bx, by } = baseControl(a1o, a2o, 0.82);

    // Normal to chord for control separation
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const sepPx = (4 + thick * 0.35) * side;
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

  // ---------- detect bidirectional pairs among SHOWN edges ----------
  const indexOfRegion = (r: RegionName) => regionList.indexOf(r);
  const keyForPair = (a: RegionName, b: RegionName) => {
    const ai = indexOfRegion(a);
    const bi = indexOfRegion(b);
    return ai <= bi ? `${a}|${b}` : `${b}|${a}`;
  };

  const biDirKeys = useMemo(() => {
    const counts = new Map<string, number>();
    shown.forEach((f) => {
      const k = keyForPair(f.fromRegion, f.toRegion);
      counts.set(k, (counts.get(k) || 0) + 1);
    });
    const set = new Set<string>();
    counts.forEach((n, k) => {
      if (n > 1) set.add(k);
    });
    return set;
  }, [shown, regionList]);

  return (
    <div className={`panel ${className ?? ""}`}>
      <div
        className="hstack"
        style={{
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 8,
        }}
      >
        <div
          className="hstack"
          role="group"
          aria-label="Flow controls"
          style={{ gap: 12 }}
        >
          <label className="hstack" style={{ gap: 6 }}>
            <span className="caption">Min flow</span>
            <input
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
            />
            <span className="caption">{formatCurrencyCompact(threshold)}</span>
          </label>
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
            Only show focused region
          </label>
        </div>
      </div>

      <div className="legend" aria-label="Flow legend">
        <div className="hstack" style={{ gap: 8 }}>
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
          <span className="caption">• Two arcs show opposite directions</span>
        </div>
        <div className="hstack" style={{ gap: 8 }}>
          <span className="caption">Total shown:</span>
          <strong className="caption">
            {formatCurrencyCompact(shown.reduce((s, f) => s + f.amountUS, 0))}
          </strong>
          <span className="caption">Max link:</span>
          <strong className="caption">{formatCurrencyCompact(stats.max)}</strong>
          <span className="caption">Links:</span>
          <strong className="caption">{shown.length}</strong>
        </div>
      </div>

      {/* Keyboard-friendly region list */}
      <div
        className="hstack"
        style={{ gap: 6, flexWrap: "wrap", marginBottom: 6 }}
        role="toolbar"
        aria-label="Regions"
      >
        {regionList.map((r, i) => {
          const t = totalsByRegion.get(r);
          const selected = focusRegion === r;
          return (
            <button
              key={r}
              className="badge"
              aria-pressed={selected}
              data-selected={selected || undefined}
              tabIndex={i === focusIdx ? 0 : -1}
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

      <div ref={ref} style={{ width: "100%", overflow: "hidden" }}>
        <svg
          width={size}
          height={size}
          role="img"
          aria-label="Chord-like flow between regions"
        >
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
            <filter
              id={`glow-${uid}`}
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur stdDeviation="0.9" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* guide ring UNDER everything */}
          <circle
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke="var(--ring)"
            strokeDasharray="4 6"
          />

          {/* links (with non-overlapping bidirectional offsets) */}
          <g>
            {shown.map((f, idx) => {
              const a1 = regionAngles.get(f.fromRegion)!;
              const a2 = regionAngles.get(f.toRegion)!;

              const thick = amountScale(f.amountUS);

              // detect if this pair has both directions currently shown
              const key = keyForPair(f.fromRegion, f.toRegion);
              const isBi = biDirKeys.has(key);

              // choose which side of separation: +1 for canonical A→B, -1 for B→A
              const aIndex = indexOfRegion(f.fromRegion);
              const bIndex = indexOfRegion(f.toRegion);
              const fromIsCanon = aIndex <= bIndex;
              const side = isBi ? (fromIsCanon ? +1 : -1) : 0;

              const d = linkPathSeparated(a1, a2, side, thick);

              const edgeHasFocus =
                !focusRegion ||
                f.fromRegion === focusRegion ||
                f.toRegion === focusRegion;
              const isDim = !!focusRegion && !edgeHasFocus && !hideOthers;

              return (
                <path
                  key={`${f.fromRegion}->${f.toRegion}-${idx}`}
                  d={d}
                  fill="none"
                  stroke="var(--accent-2)"
                  strokeWidth={thick}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isDim ? 0.28 : 0.98}
                  markerEnd={`url(#arrow-${uid})`}
                  filter={`url(#glow-${uid})`}
                  pointerEvents="stroke"
                >
                  <title>{`${f.fromRegion} → ${f.toRegion}: ${formatCurrencyCompact(
                    f.amountUS
                  )}`}</title>
                </path>
              );
            })}
          </g>

          {/* region nodes & labels */}
          <g>
            {regionList.map((r) => {
              const ang = regionAngles.get(r)!;
              const [x, y] = polar(ang);
              const [lx, ly] = polar(ang, R + 20);
              const anchor =
                Math.cos(ang) > 0.25
                  ? "start"
                  : Math.cos(ang) < -0.25
                  ? "end"
                  : "middle";
              const t = totalsByRegion.get(r);
              const isDim = dimmed(r);
              return (
                <g
                  key={r}
                  onMouseEnter={() => setHoverRegion(r)}
                  onMouseLeave={() => setHoverRegion(null)}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={6}
                    fill="var(--gold-500)"
                    stroke="var(--ring)"
                    strokeWidth={1}
                    opacity={isDim ? 0.4 : 1}
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
