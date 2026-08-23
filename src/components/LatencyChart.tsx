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

export default function LatencyChart() {
  return (
    <figure className="chart-card latency-chart">
      <figcaption>
        <span>Figure 3 · Warm steady-state latency</span>
        <strong>Higher candidate counts stayed well inside the five-second budget</strong>
        <small>p50 and p95 latency for one binary-quantized, 512-dimensional index; no pre-filter, limit 72. Each point summarizes 100 queries.</small>
      </figcaption>
      <div className="chart-scroll">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="latency-title latency-description">
          <title id="latency-title">Median MongoDB Vector Search latency by number of candidates</title>
          <desc id="latency-description">Median latency rises from 46 milliseconds at 100 candidates to 635 milliseconds at 10,000 candidates. Ninety-fifth percentile latency reaches 668 milliseconds at 10,000 candidates.</desc>
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
          {latency.map((point) => <circle key={`p50-${point.nc}`} className="latency-dot latency-dot-p50" cx={x(point.nc)} cy={y(point.p50)} r="4" />)}
          {latency.map((point) => <rect key={`p95-${point.nc}`} className="latency-dot latency-dot-p95" x={x(point.nc) - 4} y={y(point.p95) - 4} width="8" height="8" />)}
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
