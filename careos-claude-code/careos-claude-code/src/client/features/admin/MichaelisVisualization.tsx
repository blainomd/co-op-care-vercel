/**
 * MichaelisVisualization — Michaelis-Menten saturation curve for matching capacity
 *
 * V = (Vmax × [S]) / (Km + [S])
 *
 * SVG-based chart showing the hyperbolic curve with current operating point.
 */
import { useMemo } from 'react';

interface Props {
  vmax: number;
  km: number;
  currentSubstrate: number;
  currentVelocity: number;
}

const CHART_W = 320;
const CHART_H = 180;
const PADDING = { top: 10, right: 10, bottom: 30, left: 45 };
const PLOT_W = CHART_W - PADDING.left - PADDING.right;
const PLOT_H = CHART_H - PADDING.top - PADDING.bottom;

export function MichaelisVisualization({ vmax, km, currentSubstrate, currentVelocity }: Props) {
  const maxSubstrate = Math.max(currentSubstrate * 2.5, km * 3, 30);
  const maxVelocity = vmax * 1.15;

  const curve = useMemo(() => {
    const points: string[] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const s = (maxSubstrate / steps) * i;
      const v = (vmax * s) / (km + s);
      const x = PADDING.left + (s / maxSubstrate) * PLOT_W;
      const y = PADDING.top + PLOT_H - (v / maxVelocity) * PLOT_H;
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  }, [vmax, km, maxSubstrate, maxVelocity]);

  // Current operating point
  const opX = PADDING.left + (currentSubstrate / maxSubstrate) * PLOT_W;
  const opY = PADDING.top + PLOT_H - (currentVelocity / maxVelocity) * PLOT_H;

  // Vmax line
  const vmaxY = PADDING.top + PLOT_H - (vmax / maxVelocity) * PLOT_H;

  // Km marker
  const halfVmax = vmax / 2;
  const kmX = PADDING.left + (km / maxSubstrate) * PLOT_W;
  const kmY = PADDING.top + PLOT_H - (halfVmax / maxVelocity) * PLOT_H;

  // Y-axis ticks
  const yTicks = [0, Math.round((vmax / 2) * 10) / 10, Math.round(vmax * 10) / 10];
  // X-axis ticks
  const xTicks = [0, Math.round(maxSubstrate / 2), Math.round(maxSubstrate)];

  return (
    <div>
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full"
        aria-label="Michaelis-Menten capacity curve"
      >
        {/* Grid */}
        <line
          x1={PADDING.left}
          y1={PADDING.top}
          x2={PADDING.left}
          y2={PADDING.top + PLOT_H}
          stroke="#e5e5e5"
          strokeWidth={1}
        />
        <line
          x1={PADDING.left}
          y1={PADDING.top + PLOT_H}
          x2={PADDING.left + PLOT_W}
          y2={PADDING.top + PLOT_H}
          stroke="#e5e5e5"
          strokeWidth={1}
        />

        {/* Vmax dashed line */}
        <line
          x1={PADDING.left}
          y1={vmaxY}
          x2={PADDING.left + PLOT_W}
          y2={vmaxY}
          stroke="#94a3b8"
          strokeWidth={0.5}
          strokeDasharray="4 2"
        />
        <text x={PADDING.left + PLOT_W + 2} y={vmaxY + 3} fontSize={7} fill="#94a3b8">
          Vmax
        </text>

        {/* Km marker (dashed lines to half-max point) */}
        <line
          x1={kmX}
          y1={kmY}
          x2={kmX}
          y2={PADDING.top + PLOT_H}
          stroke="#cbd5e1"
          strokeWidth={0.5}
          strokeDasharray="3 2"
        />
        <line
          x1={PADDING.left}
          y1={kmY}
          x2={kmX}
          y2={kmY}
          stroke="#cbd5e1"
          strokeWidth={0.5}
          strokeDasharray="3 2"
        />
        <text
          x={kmX - 4}
          y={PADDING.top + PLOT_H + 12}
          fontSize={7}
          fill="#94a3b8"
          textAnchor="middle"
        >
          Km
        </text>

        {/* Curve */}
        <polyline points={curve} fill="none" stroke="#6b8f71" strokeWidth={2} />

        {/* Current operating point */}
        <line
          x1={opX}
          y1={opY}
          x2={opX}
          y2={PADDING.top + PLOT_H}
          stroke="#c17f59"
          strokeWidth={0.5}
          strokeDasharray="2 2"
        />
        <line
          x1={PADDING.left}
          y1={opY}
          x2={opX}
          y2={opY}
          stroke="#c17f59"
          strokeWidth={0.5}
          strokeDasharray="2 2"
        />
        <circle cx={opX} cy={opY} r={4} fill="#c17f59" stroke="white" strokeWidth={1.5} />

        {/* Y-axis label */}
        <text
          x={8}
          y={PADDING.top + PLOT_H / 2}
          fontSize={7}
          fill="#64748b"
          textAnchor="middle"
          transform={`rotate(-90, 8, ${PADDING.top + PLOT_H / 2})`}
        >
          V (tasks/hr)
        </text>

        {/* X-axis label */}
        <text
          x={PADDING.left + PLOT_W / 2}
          y={CHART_H - 2}
          fontSize={7}
          fill="#64748b"
          textAnchor="middle"
        >
          [S] Open Tasks
        </text>

        {/* Y-axis ticks */}
        {yTicks.map((tick) => {
          const y = PADDING.top + PLOT_H - (tick / maxVelocity) * PLOT_H;
          return (
            <text
              key={`y-${tick}`}
              x={PADDING.left - 4}
              y={y + 3}
              fontSize={7}
              fill="#94a3b8"
              textAnchor="end"
            >
              {tick}
            </text>
          );
        })}

        {/* X-axis ticks */}
        {xTicks.map((tick) => {
          const x = PADDING.left + (tick / maxSubstrate) * PLOT_W;
          return (
            <text
              key={`x-${tick}`}
              x={x}
              y={PADDING.top + PLOT_H + 12}
              fontSize={7}
              fill="#94a3b8"
              textAnchor="middle"
            >
              {tick}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded bg-sage" /> Capacity Curve
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-copper" /> Current (
          {currentSubstrate} tasks, {currentVelocity}/hr)
        </span>
      </div>
    </div>
  );
}
