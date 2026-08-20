import { useId, useState } from "react";

type Result = {
  nc: number;
  mean: number;
  median: number;
  p5: number;
  p95: number;
  latency: number;
  perfect: number;
};

const binary: Result[] = [
  { nc: 360, mean: .7094, median: .7222, p5: .4028, p95: .9861, latency: 1165.4, perfect: 4 },
  { nc: 720, mean: .7940, median: .8194, p5: .4861, p95: 1, latency: 648.6, perfect: 8 },
  { nc: 1080, mean: .8365, median: .8611, p5: .5556, p95: 1, latency: 607.9, perfect: 11 },
  { nc: 1440, mean: .8596, median: .8889, p5: .5972, p95: 1, latency: 585.6, perfect: 13 },
  { nc: 4000, mean: .9245, median: .9583, p5: .7083, p95: 1, latency: 3508.8, perfect: 24 },
  { nc: 10000, mean: .9578, median: .9861, p5: .8194, p95: 1, latency: 7048, perfect: 38 },
];

const scalar: Result[] = [
  { nc: 360, mean: .7231, median: .8472, p5: .1944, p95: .9861, latency: 3141.9, perfect: 0 },
  { nc: 720, mean: .7261, median: .8472, p5: .1944, p95: .9861, latency: 1939.9, perfect: 0 },
  { nc: 1080, mean: .7274, median: .8542, p5: .1944, p95: .9861, latency: 1867.9, perfect: 0 },
  { nc: 1440, mean: .7300, median: .8611, p5: .1944, p95: .9861, latency: 1829.7, perfect: 0 },
  { nc: 4000, mean: .7309, median: .8611, p5: .1944, p95: .9861, latency: 12039.7, perfect: 0 },
  { nc: 10000, mean: .7312, median: .8611, p5: .1944, p95: .9861, latency: 27582.2, perfect: 0 },
];

const width = 760;
const height = 330;
const margin = { top: 24, right: 24, bottom: 54, left: 56 };
const plotWidth = width - margin.left - margin.right;
const plotHeight = height - margin.top - margin.bottom;
const xs = binary.map((_, index) => margin.left + (plotWidth * index) / (binary.length - 1));
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
const ms = (value: number) => value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 1 : 2)} s` : `${Math.round(value)} ms`;
const linePath = (values: number[], y: (value: number) => number) => values.map((value, index) => `${index ? "L" : "M"}${xs[index]},${y(value)}`).join(" ");

function Axis({ y, ticks }: { y: (value: number) => number; ticks: number[] }) {
  return <>
    {ticks.map((tick) => <g key={tick}>
      <line className="chart-grid" x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} />
      <text className="chart-axis-label" x={margin.left - 10} y={y(tick) + 4} textAnchor="end">{Math.round(tick * 100)}%</text>
    </g>)}
    {binary.map((result, index) => <text key={result.nc} className="chart-axis-label" x={xs[index]} y={height - 20} textAnchor="middle">{result.nc >= 1000 ? `${result.nc / 1000}k` : result.nc}</text>)}
  </>;
}

export default function QuantizationCharts() {
  const [selected, setSelected] = useState(3);
  const recallTitle = useId();
  const tailTitle = useId();
  const costTitle = useId();
  const recallY = (value: number) => margin.top + ((.98 - value) / (.98 - .68)) * plotHeight;
  const tailY = (value: number) => margin.top + ((1.02 - value) / (1.02 - .15)) * plotHeight;
  const latencyX = (value: number) => margin.left + ((Math.log10(value) - Math.log10(500)) / (Math.log10(30000) - Math.log10(500))) * plotWidth;
  const costY = recallY;
  const binaryBand = [...binary.map((item, index) => `${xs[index]},${tailY(item.p95)}`), ...binary.slice().reverse().map((item, reverseIndex) => `${xs[binary.length - 1 - reverseIndex]},${tailY(item.p5)}`)].join(" ");
  const scalarBand = [...scalar.map((item, index) => `${xs[index]},${tailY(item.p95)}`), ...scalar.slice().reverse().map((item, reverseIndex) => `${xs[scalar.length - 1 - reverseIndex]},${tailY(item.p5)}`)].join(" ");
  const selectedBinary = binary[selected];
  const selectedScalar = scalar[selected];

  return <div className="chart-suite">
    <div className="candidate-control" aria-label="Choose a numCandidates setting">
      <span>numCandidates</span>
      <div>
        {binary.map((result, index) => <button
          type="button"
          key={result.nc}
          className={selected === index ? "is-active" : ""}
          aria-pressed={selected === index}
          onClick={() => setSelected(index)}
        >{result.nc}</button>)}
      </div>
    </div>

    <div className="selected-result" aria-live="polite">
      <div><span>binary recall</span><strong>{pct(selectedBinary.mean)}</strong><small>{ms(selectedBinary.latency)} median</small></div>
      <div><span>scalar recall</span><strong>{pct(selectedScalar.mean)}</strong><small>{ms(selectedScalar.latency)} median</small></div>
      <p>At {selectedBinary.nc.toLocaleString()} candidates, binary is <strong>{Math.abs((selectedBinary.mean - selectedScalar.mean) * 100).toFixed(1)} points {selectedBinary.mean >= selectedScalar.mean ? "ahead" : "behind"}</strong> while using {selectedBinary.latency <= selectedScalar.latency ? `${(selectedScalar.latency / selectedBinary.latency).toFixed(1)}× less` : `${(selectedBinary.latency / selectedScalar.latency).toFixed(1)}× more`} median query time.</p>
    </div>

    <figure className="chart-card">
      <figcaption><span>Figure 1 · Mean recall</span><strong>Recall keeps climbing for binary</strong><small>Mean recall@72 across 300 queries. Select a candidate setting above to inspect it.</small></figcaption>
      <div className="chart-scroll">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={recallTitle}>
          <title id={recallTitle}>Mean recall by number of candidates for binary and scalar quantization</title>
          <Axis y={recallY} ticks={[.7, .75, .8, .85, .9, .95]} />
          <path className="chart-line chart-line-binary" d={linePath(binary.map((item) => item.mean), recallY)} />
          <path className="chart-line chart-line-scalar" d={linePath(scalar.map((item) => item.mean), recallY)} />
          {binary.map((item, index) => <circle key={`b-${item.nc}`} className={`chart-dot chart-dot-binary ${selected === index ? "is-selected" : ""}`} cx={xs[index]} cy={recallY(item.mean)} r={selected === index ? 7 : 4} />)}
          {scalar.map((item, index) => <rect key={`s-${item.nc}`} className={`chart-dot chart-dot-scalar ${selected === index ? "is-selected" : ""}`} x={xs[index] - (selected === index ? 6 : 4)} y={recallY(item.mean) - (selected === index ? 6 : 4)} width={selected === index ? 12 : 8} height={selected === index ? 12 : 8} />)}
          <line className="chart-selection" x1={xs[selected]} x2={xs[selected]} y1={margin.top} y2={height - margin.bottom} />
          <text className="chart-x-title" x={width / 2} y={height - 2} textAnchor="middle">numCandidates</text>
        </svg>
      </div>
      <div className="chart-legend"><span className="legend-binary">binary</span><span className="legend-scalar">scalar</span><span>circle vs square markers remain distinguishable without colour</span></div>
    </figure>

    <figure className="chart-card">
      <figcaption><span>Figure 2 · Query tail</span><strong>The floor that more search cannot lift</strong><small>Median with the 5th-to-95th percentile band. Binary's full distribution moves; scalar's lower tail stays fixed.</small></figcaption>
      <div className="chart-scroll">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={tailTitle}>
          <title id={tailTitle}>Median recall and fifth to ninety-fifth percentile bands</title>
          <Axis y={tailY} ticks={[.2, .4, .6, .8, 1]} />
          <polygon className="chart-band chart-band-binary" points={binaryBand} />
          <polygon className="chart-band chart-band-scalar" points={scalarBand} />
          <path className="chart-line chart-line-binary" d={linePath(binary.map((item) => item.median), tailY)} />
          <path className="chart-line chart-line-scalar" d={linePath(scalar.map((item) => item.median), tailY)} />
          <line className="chart-selection" x1={xs[selected]} x2={xs[selected]} y1={margin.top} y2={height - margin.bottom} />
          <text className="chart-x-title" x={width / 2} y={height - 2} textAnchor="middle">numCandidates</text>
        </svg>
      </div>
      <div className="tail-readout"><span>binary p5 <strong>{pct(selectedBinary.p5)}</strong></span><span>scalar p5 <strong>{pct(selectedScalar.p5)}</strong></span><span>perfect binary queries <strong>{selectedBinary.perfect}%</strong></span></div>
    </figure>

    <figure className="chart-card">
      <figcaption><span>Figure 3 · Cost of recall</span><strong>Accuracy against median query latency</strong><small>Up and to the left is better. Latency uses a logarithmic scale and reflects this benchmark environment, not a service-level promise.</small></figcaption>
      <div className="chart-scroll">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={costTitle}>
          <title id={costTitle}>Recall plotted against median query latency</title>
          {[.7, .75, .8, .85, .9, .95].map((tick) => <g key={tick}>
            <line className="chart-grid" x1={margin.left} x2={width - margin.right} y1={costY(tick)} y2={costY(tick)} />
            <text className="chart-axis-label" x={margin.left - 10} y={costY(tick) + 4} textAnchor="end">{Math.round(tick * 100)}%</text>
          </g>)}
          {[500, 1000, 3000, 10000, 30000].map((tick) => <g key={tick}>
            <line className="chart-grid chart-grid-vertical" x1={latencyX(tick)} x2={latencyX(tick)} y1={margin.top} y2={height - margin.bottom} />
            <text className="chart-axis-label" x={latencyX(tick)} y={height - 20} textAnchor="middle">{tick >= 1000 ? `${tick / 1000}s` : `${tick}ms`}</text>
          </g>)}
          <path className="chart-line chart-line-binary" d={binary.map((item, index) => `${index ? "L" : "M"}${latencyX(item.latency)},${costY(item.mean)}`).join(" ")} />
          <path className="chart-line chart-line-scalar" d={scalar.map((item, index) => `${index ? "L" : "M"}${latencyX(item.latency)},${costY(item.mean)}`).join(" ")} />
          {binary.map((item, index) => <g key={`cb-${item.nc}`}><circle className={`chart-dot chart-dot-binary ${selected === index ? "is-selected" : ""}`} cx={latencyX(item.latency)} cy={costY(item.mean)} r={selected === index ? 7 : 4} /><text className="chart-point-label" x={latencyX(item.latency) + 8} y={costY(item.mean) - 8}>{item.nc >= 1000 ? `${item.nc / 1000}k` : item.nc}</text></g>)}
          {scalar.map((item, index) => <rect key={`cs-${item.nc}`} className={`chart-dot chart-dot-scalar ${selected === index ? "is-selected" : ""}`} x={latencyX(item.latency) - (selected === index ? 6 : 4)} y={costY(item.mean) - (selected === index ? 6 : 4)} width={selected === index ? 12 : 8} height={selected === index ? 12 : 8} />)}
          <text className="chart-x-title" x={width / 2} y={height - 2} textAnchor="middle">median query latency · logarithmic scale</text>
        </svg>
      </div>
    </figure>
  </div>;
}
