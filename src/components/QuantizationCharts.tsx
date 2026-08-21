import { useId, useState, type KeyboardEvent } from "react";

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
const round = (value: number) => Number(value.toFixed(3));
const xs = binary.map((_, index) => round(margin.left + (plotWidth * index) / (binary.length - 1)));
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
const ms = (value: number) => value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 1 : 2)} s` : `${Math.round(value)} ms`;
const linePath = (values: number[], y: (value: number) => number) => values.map((value, index) => `${index ? "L" : "M"}${xs[index]},${round(y(value))}`).join(" ");

type HoveredPoint = {
  chart: "recall" | "tail" | "cost";
  index: number;
  series?: "binary" | "scalar";
};

function Tooltip({ x, y, title, lines }: { x: number; y: number; title: string; lines: string[] }) {
  const tooltipWidth = 174;
  const tooltipHeight = 34 + lines.length * 17;
  const left = x > width - tooltipWidth - 22 ? x - tooltipWidth - 12 : x + 12;
  const top = Math.max(margin.top + 4, Math.min(y - tooltipHeight / 2, height - margin.bottom - tooltipHeight - 4));

  return <g className="chart-tooltip" transform={`translate(${round(left)} ${round(top)})`} aria-hidden="true">
    <rect width={tooltipWidth} height={tooltipHeight} rx="4" />
    <text className="chart-tooltip-title" x="12" y="18">{title}</text>
    {lines.map((line, index) => <text key={line} x="12" y={38 + index * 17}>{line}</text>)}
  </g>;
}

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
  const [hovered, setHovered] = useState<HoveredPoint | null>(null);
  const recallTitle = useId();
  const tailTitle = useId();
  const costTitle = useId();
  const recallY = (value: number) => round(margin.top + ((.98 - value) / (.98 - .68)) * plotHeight);
  const tailY = (value: number) => round(margin.top + ((1.02 - value) / (1.02 - .15)) * plotHeight);
  const latencyX = (value: number) => round(margin.left + ((Math.log10(value) - Math.log10(500)) / (Math.log10(30000) - Math.log10(500))) * plotWidth);
  const costY = recallY;
  const binaryBand = [...binary.map((item, index) => `${xs[index]},${tailY(item.p95)}`), ...binary.slice().reverse().map((item, reverseIndex) => `${xs[binary.length - 1 - reverseIndex]},${tailY(item.p5)}`)].join(" ");
  const scalarBand = [...scalar.map((item, index) => `${xs[index]},${tailY(item.p95)}`), ...scalar.slice().reverse().map((item, reverseIndex) => `${xs[scalar.length - 1 - reverseIndex]},${tailY(item.p5)}`)].join(" ");
  const selectedBinary = binary[selected];
  const selectedScalar = scalar[selected];
  const activate = (point: HoveredPoint) => {
    setSelected(point.index);
    setHovered(point);
  };
  const activateFromKeyboard = (event: KeyboardEvent<SVGElement>, point: HoveredPoint) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate(point);
    }
  };
  const columnStart = (index: number) => index === 0 ? margin.left : round((xs[index - 1] + xs[index]) / 2);
  const columnEnd = (index: number) => index === xs.length - 1 ? width - margin.right : round((xs[index] + xs[index + 1]) / 2);

  return <div className="chart-suite">
    <div className="candidate-control" aria-label="Choose a numCandidates setting">
      <span>numCandidates</span>
      <div>
        {binary.map((result, index) => <button
          type="button"
          key={result.nc}
          className={selected === index ? "is-active" : ""}
          aria-pressed={selected === index}
          onClick={() => { setSelected(index); setHovered(null); }}
        >{result.nc}</button>)}
      </div>
    </div>

    <div className="selected-result" aria-live="polite">
      <div><span>MongoDB binary</span><strong>{pct(selectedBinary.mean)}</strong><small>{ms(selectedBinary.latency)} median</small></div>
      <div><span>MongoDB scalar</span><strong>{pct(selectedScalar.mean)}</strong><small>{ms(selectedScalar.latency)} median</small></div>
      <p>At {selectedBinary.nc.toLocaleString()} candidates, binary is <strong>{Math.abs((selectedBinary.mean - selectedScalar.mean) * 100).toFixed(1)} points {selectedBinary.mean >= selectedScalar.mean ? "ahead" : "behind"}</strong> while using {selectedBinary.latency <= selectedScalar.latency ? `${(selectedScalar.latency / selectedBinary.latency).toFixed(1)}× less` : `${(selectedBinary.latency / selectedScalar.latency).toFixed(1)}× more`} median query time.</p>
    </div>

    <figure className="chart-card">
      <figcaption><span>Figure 1 · Mean recall</span><strong>Recall keeps climbing for MongoDB binary quantization</strong><small>Mean recall@72 across 300 MongoDB Vector Search queries. Hover or focus the graph—or select a candidate setting above—to inspect it.</small></figcaption>
      <div className="chart-scroll">
        <svg viewBox={`0 0 ${width} ${height}`} role="group" aria-labelledby={recallTitle} onPointerLeave={() => setHovered(null)}>
          <title id={recallTitle}>MongoDB Vector Search mean recall by number of candidates for binary and scalar quantization</title>
          <Axis y={recallY} ticks={[.7, .75, .8, .85, .9, .95]} />
          <path className="chart-line chart-line-binary" d={linePath(binary.map((item) => item.mean), recallY)} />
          <path className="chart-line chart-line-scalar" d={linePath(scalar.map((item) => item.mean), recallY)} />
          {binary.map((item, index) => <circle key={`b-${item.nc}`} className={`chart-dot chart-dot-binary ${selected === index ? "is-selected" : ""}`} cx={xs[index]} cy={recallY(item.mean)} r={selected === index ? 7 : 4} />)}
          {scalar.map((item, index) => <rect key={`s-${item.nc}`} className={`chart-dot chart-dot-scalar ${selected === index ? "is-selected" : ""}`} x={xs[index] - (selected === index ? 6 : 4)} y={recallY(item.mean) - (selected === index ? 6 : 4)} width={selected === index ? 12 : 8} height={selected === index ? 12 : 8} />)}
          <line className="chart-selection" x1={xs[selected]} x2={xs[selected]} y1={margin.top} y2={height - margin.bottom} />
          {binary.map((item, index) => <rect
            key={`rh-${item.nc}`}
            className="chart-hit-area"
            x={columnStart(index)}
            y={margin.top}
            width={columnEnd(index) - columnStart(index)}
            height={plotHeight}
            tabIndex={0}
            role="button"
            aria-label={`${item.nc} candidates: binary recall ${pct(item.mean)}, scalar recall ${pct(scalar[index].mean)}`}
            onPointerEnter={() => activate({ chart: "recall", index })}
            onMouseEnter={() => activate({ chart: "recall", index })}
            onClick={() => activate({ chart: "recall", index })}
            onFocus={() => activate({ chart: "recall", index })}
            onKeyDown={(event) => activateFromKeyboard(event, { chart: "recall", index })}
            onBlur={() => setHovered(null)}
          />)}
          {hovered?.chart === "recall" && <Tooltip
            x={xs[hovered.index]}
            y={Math.min(recallY(binary[hovered.index].mean), recallY(scalar[hovered.index].mean))}
            title={`numCandidates ${binary[hovered.index].nc.toLocaleString()}`}
            lines={[`binary recall  ${pct(binary[hovered.index].mean)}`, `scalar recall  ${pct(scalar[hovered.index].mean)}`]}
          />}
          <text className="chart-x-title" x={width / 2} y={height - 2} textAnchor="middle">numCandidates</text>
        </svg>
      </div>
      <div className="chart-legend"><span className="legend-binary">binary</span><span className="legend-scalar">scalar</span><span>circle vs square markers remain distinguishable without colour</span></div>
    </figure>

    <figure className="chart-card">
      <figcaption><span>Figure 2 · Query tail</span><strong>The floor that more search cannot lift</strong><small>Median with the 5th-to-95th percentile band. Hover or focus a candidate column to compare its lower tail.</small></figcaption>
      <div className="chart-scroll">
        <svg viewBox={`0 0 ${width} ${height}`} role="group" aria-labelledby={tailTitle} onPointerLeave={() => setHovered(null)}>
          <title id={tailTitle}>Median recall and fifth to ninety-fifth percentile bands</title>
          <Axis y={tailY} ticks={[.2, .4, .6, .8, 1]} />
          <polygon className="chart-band chart-band-binary" points={binaryBand} />
          <polygon className="chart-band chart-band-scalar" points={scalarBand} />
          <path className="chart-line chart-line-binary" d={linePath(binary.map((item) => item.median), tailY)} />
          <path className="chart-line chart-line-scalar" d={linePath(scalar.map((item) => item.median), tailY)} />
          {binary.map((item, index) => <circle key={`tb-${item.nc}`} className={`chart-dot chart-dot-binary ${selected === index ? "is-selected" : ""}`} cx={xs[index]} cy={tailY(item.median)} r={selected === index ? 7 : 4} />)}
          {scalar.map((item, index) => <rect key={`ts-${item.nc}`} className={`chart-dot chart-dot-scalar ${selected === index ? "is-selected" : ""}`} x={xs[index] - (selected === index ? 6 : 4)} y={tailY(item.median) - (selected === index ? 6 : 4)} width={selected === index ? 12 : 8} height={selected === index ? 12 : 8} />)}
          <line className="chart-selection" x1={xs[selected]} x2={xs[selected]} y1={margin.top} y2={height - margin.bottom} />
          {binary.map((item, index) => <rect
            key={`th-${item.nc}`}
            className="chart-hit-area"
            x={columnStart(index)}
            y={margin.top}
            width={columnEnd(index) - columnStart(index)}
            height={plotHeight}
            tabIndex={0}
            role="button"
            aria-label={`${item.nc} candidates: binary fifth percentile ${pct(item.p5)}, scalar fifth percentile ${pct(scalar[index].p5)}`}
            onPointerEnter={() => activate({ chart: "tail", index })}
            onMouseEnter={() => activate({ chart: "tail", index })}
            onClick={() => activate({ chart: "tail", index })}
            onFocus={() => activate({ chart: "tail", index })}
            onKeyDown={(event) => activateFromKeyboard(event, { chart: "tail", index })}
            onBlur={() => setHovered(null)}
          />)}
          {hovered?.chart === "tail" && <Tooltip
            x={xs[hovered.index]}
            y={Math.min(tailY(binary[hovered.index].median), tailY(scalar[hovered.index].median))}
            title={`numCandidates ${binary[hovered.index].nc.toLocaleString()}`}
            lines={[`binary p5  ${pct(binary[hovered.index].p5)}`, `scalar p5  ${pct(scalar[hovered.index].p5)}`]}
          />}
          <text className="chart-x-title" x={width / 2} y={height - 2} textAnchor="middle">numCandidates</text>
        </svg>
      </div>
      <div className="tail-readout"><span>binary p5 <strong>{pct(selectedBinary.p5)}</strong></span><span>scalar p5 <strong>{pct(selectedScalar.p5)}</strong></span><span>perfect binary queries <strong>{selectedBinary.perfect}%</strong></span></div>
    </figure>

    <figure className="chart-card">
      <figcaption><span>Figure 3 · Cost of recall</span><strong>Accuracy against median query latency</strong><small>Up and to the left is better. Hover or focus any point for its exact recall, latency, and candidate setting.</small></figcaption>
      <div className="chart-scroll">
        <svg viewBox={`0 0 ${width} ${height}`} role="group" aria-labelledby={costTitle} onPointerLeave={() => setHovered(null)}>
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
          {binary.map((item, index) => <g
            key={`cb-${item.nc}`}
            className="chart-interactive-point"
            tabIndex={0}
            role="button"
            aria-label={`Binary, ${item.nc} candidates: ${pct(item.mean)} recall at ${ms(item.latency)}`}
            onPointerEnter={() => activate({ chart: "cost", index, series: "binary" })}
            onMouseEnter={() => activate({ chart: "cost", index, series: "binary" })}
            onClick={() => activate({ chart: "cost", index, series: "binary" })}
            onFocus={() => activate({ chart: "cost", index, series: "binary" })}
            onKeyDown={(event) => activateFromKeyboard(event, { chart: "cost", index, series: "binary" })}
            onBlur={() => setHovered(null)}
          ><circle className={`chart-dot chart-dot-binary ${selected === index ? "is-selected" : ""}`} cx={latencyX(item.latency)} cy={costY(item.mean)} r={selected === index ? 7 : 4} /><circle className="chart-point-hit" cx={latencyX(item.latency)} cy={costY(item.mean)} r="15" /><text className="chart-point-label" x={latencyX(item.latency) + 8} y={costY(item.mean) - 8}>{item.nc >= 1000 ? `${item.nc / 1000}k` : item.nc}</text></g>)}
          {scalar.map((item, index) => <g
            key={`cs-${item.nc}`}
            className="chart-interactive-point"
            tabIndex={0}
            role="button"
            aria-label={`Scalar, ${item.nc} candidates: ${pct(item.mean)} recall at ${ms(item.latency)}`}
            onPointerEnter={() => activate({ chart: "cost", index, series: "scalar" })}
            onMouseEnter={() => activate({ chart: "cost", index, series: "scalar" })}
            onClick={() => activate({ chart: "cost", index, series: "scalar" })}
            onFocus={() => activate({ chart: "cost", index, series: "scalar" })}
            onKeyDown={(event) => activateFromKeyboard(event, { chart: "cost", index, series: "scalar" })}
            onBlur={() => setHovered(null)}
          ><rect className={`chart-dot chart-dot-scalar ${selected === index ? "is-selected" : ""}`} x={latencyX(item.latency) - (selected === index ? 6 : 4)} y={costY(item.mean) - (selected === index ? 6 : 4)} width={selected === index ? 12 : 8} height={selected === index ? 12 : 8} /><circle className="chart-point-hit" cx={latencyX(item.latency)} cy={costY(item.mean)} r="15" /></g>)}
          {hovered?.chart === "cost" && (() => {
            const series = hovered.series === "scalar" ? "scalar" : "binary";
            const item = series === "binary" ? binary[hovered.index] : scalar[hovered.index];
            return <Tooltip
              x={latencyX(item.latency)}
              y={costY(item.mean)}
              title={`${series} · nc ${item.nc.toLocaleString()}`}
              lines={[`recall  ${pct(item.mean)}`, `latency  ${ms(item.latency)}`]}
            />;
          })()}
          <text className="chart-x-title" x={width / 2} y={height - 2} textAnchor="middle">median query latency · logarithmic scale</text>
        </svg>
      </div>
    </figure>
  </div>;
}
