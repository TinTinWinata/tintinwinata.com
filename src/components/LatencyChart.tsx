import { useId, useState, type KeyboardEvent } from "react";

const latency = [
  { nc: 100, p50: 46, p95: 63 },
  { nc: 360, p50: 176, p95: 210 },
  { nc: 720, p50: 198, p95: 265 },
  { nc: 1000, p50: 201, p95: 229 },
  { nc: 2000, p50: 255, p95: 278 },
  { nc: 3000, p50: 299, p95: 322 },
  { nc: 4000, p50: 346, p95: 373 },
  { nc: 5000, p50: 397, p95: 428 },
  { nc: 6000, p50: 446, p95: 477 },
  { nc: 7000, p50: 494, p95: 530 },
  { nc: 8000, p50: 537, p95: 575 },
  { nc: 9000, p50: 591, p95: 637 },
  { nc: 10000, p50: 635, p95: 668 },
];

const width = 760;
const height = 350;
const margin = { top: 24, right: 24, bottom: 58, left: 62 };
const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;
const maxCandidates = 10000;
const maxLatency = 1200;
const x = (value: number) => margin.left + (plotWidth * value) / maxCandidates;
const y = (value: number) => margin.top + (1 - value / maxLatency) * plotHeight;
const path = (field: "p50" | "p95") => latency
  .map((point, index) => `${index ? "L" : "M"}${x(point.nc).toFixed(1)},${y(point[field]).toFixed(1)}`)
  .join(" ");
const yTicks = [0, 300, 600, 900, 1200];
const xTicks = [0, 1000, 5000, 10000];
const round = (value: number) => Number(value.toFixed(1));

function Tooltip({ index }: { index: number }) {
  const point = latency[index];
  const tooltipWidth = 174;
  const tooltipHeight = 68;
  const pointX = x(point.nc);
  const left = pointX > width - tooltipWidth - 22 ? pointX - tooltipWidth - 12 : pointX + 12;
  const top = Math.max(margin.top + 4, Math.min(y(point.p95) - tooltipHeight / 2, height - margin.bottom - tooltipHeight - 4));

  return <g className="chart-tooltip" transform={`translate(${round(left)} ${round(top)})`} aria-hidden="true">
    <rect width={tooltipWidth} height={tooltipHeight} rx="4" />
    <text className="chart-tooltip-title" x="12" y="18">numCandidates {point.nc.toLocaleString()}</text>
    <text x="12" y="38">p50  {point.p50} ms</text>
    <text x="12" y="55">p95  {point.p95} ms</text>
  </g>;
}

export default function LatencyChart() {
  const [selected, setSelected] = useState(latency.length - 1);
  const [hovered, setHovered] = useState<number | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const activate = (index: number) => {
    setSelected(index);
    setHovered(index);
  };
  const activateFromKeyboard = (event: KeyboardEvent<SVGElement>, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate(index);
    }
  };
  const columnStart = (index: number) => index === 0
    ? margin.left
    : round((x(latency[index - 1].nc) + x(latency[index].nc)) / 2);
  const columnEnd = (index: number) => index === latency.length - 1
    ? width - margin.right
    : round((x(latency[index].nc) + x(latency[index + 1].nc)) / 2);

  return (
    <figure className="chart-card latency-chart">
      <figcaption>
        <span>Figure 3 · Warm steady-state latency</span>
        <strong>Higher candidate counts stayed well inside the five-second budget</strong>
        <small>p50 and p95 latency for one binary-quantized, 512-dimensional index; no pre-filter, limit 72. Each point summarizes 100 queries. Hover or focus the graph to inspect a setting.</small>
      </figcaption>
      <div className="chart-scroll">
        <svg viewBox={`0 0 ${width} ${height}`} role="group" aria-labelledby={`${titleId} ${descriptionId}`} onPointerLeave={() => setHovered(null)}>
          <title id={titleId}>Median MongoDB Vector Search latency by number of candidates</title>
          <desc id={descriptionId}>Median latency rises from 46 milliseconds at 100 candidates to 635 milliseconds at 10,000 candidates. Ninety-fifth percentile latency reaches 668 milliseconds at 10,000 candidates. Hover or focus a candidate setting for exact values.</desc>
          {yTicks.map((tick) => (
            <g key={tick}>
              <line className="chart-grid" x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} />
              <text className="chart-axis-label" x={margin.left - 10} y={y(tick) + 4} textAnchor="end">{tick === 0 ? "0" : `${tick} ms`}</text>
            </g>
          ))}
          {xTicks.map((tick) => (
            <text key={tick} className="chart-axis-label" x={x(tick)} y={height - 23} textAnchor={tick === 0 ? "start" : tick === maxCandidates ? "end" : "middle"}>{tick.toLocaleString()}</text>
          ))}
          <path className="chart-line chart-line-p50" d={path("p50")} />
          <path className="chart-line chart-line-p95" d={path("p95")} />
          {latency.map((point, index) => <circle key={`p50-${point.nc}`} className={`latency-dot latency-dot-p50 ${selected === index ? "is-selected" : ""}`} cx={x(point.nc)} cy={y(point.p50)} r={selected === index ? 7 : 4} />)}
          {latency.map((point, index) => <rect key={`p95-${point.nc}`} className={`latency-dot latency-dot-p95 ${selected === index ? "is-selected" : ""}`} x={x(point.nc) - (selected === index ? 6 : 4)} y={y(point.p95) - (selected === index ? 6 : 4)} width={selected === index ? 12 : 8} height={selected === index ? 12 : 8} />)}
          <line className="chart-selection" x1={x(latency[selected].nc)} x2={x(latency[selected].nc)} y1={margin.top} y2={height - margin.bottom} />
          {latency.map((point, index) => <rect
            key={`latency-hit-${point.nc}`}
            className="chart-hit-area"
            x={columnStart(index)}
            y={margin.top}
            width={columnEnd(index) - columnStart(index)}
            height={plotHeight}
            tabIndex={0}
            role="button"
            aria-label={`${point.nc.toLocaleString()} candidates: p50 ${point.p50} milliseconds, p95 ${point.p95} milliseconds`}
            onPointerEnter={() => activate(index)}
            onMouseEnter={() => activate(index)}
            onClick={() => activate(index)}
            onFocus={() => activate(index)}
            onKeyDown={(event) => activateFromKeyboard(event, index)}
            onBlur={() => setHovered(null)}
          />)}
          {hovered !== null && <Tooltip index={hovered} />}
          <text className="chart-x-title" x={width / 2} y={height - 3} textAnchor="middle">numCandidates</text>
        </svg>
      </div>
      <div className="chart-legend">
        <span className="legend-p50">p50</span>
        <span className="legend-p95">p95</span>
        <span>circle and square markers remain distinguishable without colour</span>
      </div>
    </figure>
  );
}
