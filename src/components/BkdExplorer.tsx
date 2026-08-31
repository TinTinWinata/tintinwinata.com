import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import {
  MAX_DIMS,
  SPACE,
  clampValue,
  createTree,
  fieldPad,
  fieldSize,
  fold,
  fullQuery,
  intersect,
  layout,
  leafPoints,
  leafSortDim,
  presetQueries,
  px,
  py,
  sharedPrefixLength,
  sortableBytes,
  splitsDone,
  ticks,
  unpx,
  unpy,
  visibleAfter,
  type Axes,
  type BkdNode,
  type NodeState,
  type Query,
  type Shape,
} from "./bkd";
import "./Bkd.css";

type Mode = "build" | "search";
type Drag = { ax: number; ay: number; bx: number; by: number };

const counts = [32, 64, 128];
const leafSizes = [4, 8, 16];
const dimCounts = [1, 2, 3, 4];
const shapes: Array<{ id: Shape; label: string }> = [
  { id: "clustered", label: "clustered" },
  { id: "uniform", label: "uniform" },
  { id: "correlated", label: "correlated" },
];

export default function BkdExplorer() {
  const [count, setCount] = useState(64);
  const [leafSize, setLeafSize] = useState(8);
  const [dims, setDims] = useState(1);
  const [shape, setShape] = useState<Shape>("clustered");
  const [seed, setSeed] = useState(315);
  const [names, setNames] = useState<string[]>(Array.from({ length: MAX_DIMS }, () => ""));
  const tree = useMemo(() => createTree({ count, leafSize, shape, seed, dims }), [count, leafSize, shape, seed, dims]);

  const [axes, setAxes] = useState<Axes>({ x: 0, y: 1 });
  const [mode, setMode] = useState<Mode>("build");
  const [buildStep, setBuildStep] = useState(tree.steps.length);
  const [visitStep, setVisitStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [inspected, setInspected] = useState<number | null>(null);
  const [query, setQuery] = useState<Query>(() => fullQuery(dims));
  const [drag, setDrag] = useState<Drag | null>(null);

  const dragRef = useRef<Drag | null>(null);
  const fieldRef = useRef<SVGSVGElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const treeWrapRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDialogElement>(null);
  const [fieldPx, setFieldPx] = useState(440);
  const [treeScale, setTreeScale] = useState(1);
  const hintReserve = dims > 2 ? 58 : 30;

  const dimName = (dim: number) => names[dim]?.trim() || `dim ${dim}`;
  const shortName = (dim: number) => {
    const full = dimName(dim);
    return full.length > 8 ? `${full.slice(0, 7)}…` : full;
  };

  /* The projection is normalised on every render rather than in an effect: an
     effect lands one render late, and a stale axis index would read past the
     end of a lower-dimensional cell. */
  const safeAxes = useMemo<Axes>(() => {
    if (dims === 1) return { x: 0, y: null };
    const x = Math.min(Math.max(0, axes.x), dims - 1);
    let y = axes.y === null ? 1 : Math.min(Math.max(0, axes.y), dims - 1);
    if (y === x) y = (x + 1) % dims;
    return { x, y };
  }, [axes, dims]);

  /* A new corpus or a new projection invalidates the query: the plane on
     screen always has to be the plane that explains the verdicts. */
  useEffect(() => {
    setQuery(presetQueries(tree, safeAxes)[0].query);
    setBuildStep(tree.steps.length);
    setInspected(null);
    setPlaying(false);
  }, [tree, safeAxes]);

  const ax = safeAxes.x;
  const ay = safeAxes.y;

  const dragToQuery = (held: Drag): Query => {
    const next = fullQuery(dims);
    next.min[ax] = Math.min(held.ax, held.bx);
    next.max[ax] = Math.max(held.ax, held.bx);
    if (ay !== null) {
      next.min[ay] = Math.min(held.ay, held.by);
      next.max[ay] = Math.max(held.ay, held.by);
    }
    return next;
  };

  /* The committed query can still be the previous dimension count for one
     render, so pad it here rather than reading past its end. */
  const active = useMemo<Query>(() => {
    const base = drag ? dragToQuery(drag) : query;
    if (base.min.length === dims) return base;
    const padded = fullQuery(dims);
    for (let dim = 0; dim < Math.min(dims, base.min.length); dim += 1) {
      padded.min[dim] = base.min[dim];
      padded.max[dim] = base.max[dim];
    }
    return padded;
  }, [drag, query, dims, ax, ay]);
  const queryKey = `${active.min.join(",")}|${active.max.join(",")}`;
  const visits = useMemo(() => intersect(tree, active), [tree, queryKey]);

  const revealed = Math.min(visitStep, visits.length);
  const traversal = fold(visits, revealed);

  useEffect(() => {
    setVisitStep(visits.length);
  }, [visits]);

  const buildAt = Math.min(buildStep, tree.steps.length);
  const total = mode === "build" ? tree.steps.length : visits.length;
  const current = mode === "build" ? buildAt : revealed;
  const setCurrent = mode === "build" ? setBuildStep : setVisitStep;

  useEffect(() => {
    if (!playing) return;
    if (current >= total) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setCurrent(current + 1), 520);
    return () => window.clearTimeout(timer);
  }, [playing, current, total, setCurrent]);

  const visible = visibleAfter(tree, buildAt);
  const done = splitsDone(tree, buildAt);
  const treeVisible = mode === "build" ? visible : new Set(tree.nodes.map((node) => node.id));
  const view = layout(tree, treeVisible);

  /* The field is square and has to fit the height the dashboard grid hands the
     stage while leaving the tree column enough width; the tree is vector, so it
     takes whatever room is left rather than sitting in dead space. */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const box = stage.getBoundingClientRect();
      if (!box.height) return;
      /* Reserve room for the hint under the plot. The taller reserve is used
         only when the hidden-dimension clause is present, so the value never
         depends on the measured layout and cannot feed back into it. */
      setFieldPx(Math.max(280, Math.min(box.height - hintReserve, box.width - 16 - 660)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [hintReserve]);

  useLayoutEffect(() => {
    const wrap = treeWrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const box = wrap.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const next = Math.min((box.width - 18) / view.width, (box.height - 18) / view.height, 1.4);
      setTreeScale((now) => (Math.abs(now - next) > 0.03 ? Math.max(0.5, next) : now));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [view.width, view.height]);

  const frontier = tree.nodes.filter((node) => visible.has(node.id) && !done.has(node.id));
  const activeStep = mode === "build" && buildAt > 0 ? tree.steps[buildAt - 1] : null;
  const splitNodes = mode === "build" ? tree.nodes.filter((node) => done.has(node.id)) : tree.nodes.filter((node) => node.dim !== null);
  const hiddenSplit = activeStep !== null && activeStep.dim !== ax && activeStep.dim !== ay;
  /* With more than two dimensions most boundaries fall outside the projection.
     Saying so keeps an almost-empty plot from reading as a broken one. */
  const offscreenSplits = tree.steps.filter((step) => step.dim !== ax && step.dim !== ay).length;

  const hoveredNode = hovered === null ? null : tree.nodes.find((node) => node.id === hovered) ?? null;
  const inspectedNode = inspected === null ? null : tree.nodes.find((node) => node.id === inspected) ?? null;
  const highlighted = new Set(hoveredNode ? hoveredNode.points.map((point) => point.doc) : []);

  /* Projection onto the two chosen dimensions. With a single dimension the
     vertical axis carries the doc id instead, so the points stay separable. */
  const cellRect = (node: BkdNode) => {
    const left = px(node.cell.min[ax]);
    const right = px(node.cell.max[ax]);
    const top = ay === null ? py(SPACE) : py(node.cell.max[ay]);
    const bottom = ay === null ? py(0) : py(node.cell.min[ay]);
    return { x: left, y: top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
  };

  const queryRect = () => {
    const left = px(active.min[ax]);
    const right = px(active.max[ax]);
    const top = ay === null ? py(SPACE) : py(active.max[ay]);
    const bottom = ay === null ? py(0) : py(active.min[ay]);
    return { x: left, y: top, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
  };

  const pointY = (point: { doc: number; values: number[] }) =>
    ay === null ? py((point.doc / Math.max(1, tree.points.length - 1)) * SPACE) : py(point.values[ay]);

  /* A split node shows the interval it owns on the dimension it splits, rather
     than a one-sided "< value": the bound you cannot see is the one people have
     to trace up the tree for. The split value is still legible as the shared
     edge between the two children, and stays in the tooltip. */
  const spanOf = (node: BkdNode) => {
    const dim = node.dim ?? 0;
    return `${node.cell.min[dim]}–${node.cell.max[dim]}`;
  };

  const nodeDetail = (node: BkdNode) => {
    if (node.leaf !== null) return `${node.points.length} pts`;
    if (mode === "build" && !done.has(node.id)) return `${node.points.length} pts`;
    const span = spanOf(node);
    const named = `${shortName(node.dim ?? 0)} ${span}`;
    /* Fall back to the bare interval only when the name cannot fit the box. */
    return named.length <= Math.floor((view.nodeWidth - 8) / 6) ? named : span;
  };

  const nodeState = (node: BkdNode): NodeState | "split" | "frontier" | "waiting" => {
    if (mode === "build") return done.has(node.id) ? "split" : node.leaf !== null ? "frontier" : "waiting";
    return traversal.nodeStates[node.id] ?? "idle";
  };

  const toValues = (event: PointerEvent<SVGSVGElement>): [number, number] | null => {
    const svg = fieldRef.current;
    if (!svg) return null;
    const box = svg.getBoundingClientRect();
    if (!box.width) return null;
    const scale = fieldSize / box.width;
    return [
      clampValue(unpx((event.clientX - box.left) * scale)),
      clampValue(unpy((event.clientY - box.top) * scale)),
    ];
  };

  const startDrag = (event: PointerEvent<SVGSVGElement>) => {
    if (mode !== "search" || event.pointerType === "touch") return;
    const values = toValues(event);
    if (!values) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* Capture is a convenience for drags that leave the figure. */
    }
    const started: Drag = { ax: values[0], ay: values[1], bx: values[0], by: values[1] };
    dragRef.current = started;
    setDrag(started);
  };

  const moveDrag = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    const values = toValues(event);
    if (!values) return;
    const next = { ...dragRef.current, bx: values[0], by: values[1] };
    dragRef.current = next;
    setDrag(next);
  };

  const endDrag = () => {
    const held = dragRef.current;
    if (!held) return;
    const next = dragToQuery(held);
    const wide = Math.abs(held.bx - held.ax) > 20;
    const tall = ay === null || Math.abs(held.by - held.ay) > 20;
    dragRef.current = null;
    setDrag(null);
    if (wide && tall) setQuery(next);
  };

  /* Typed bounds are clamped to the space and kept ordered, so the query can
     never invert while someone is mid-edit. */
  const setBound = (dim: number, edge: "min" | "max", raw: string) => {
    if (raw.trim() === "") return;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    const value = clampValue(Math.round(parsed));
    setQuery((now) => {
      const next: Query = { min: [...now.min], max: [...now.max] };
      if (edge === "min") next.min[dim] = Math.min(value, next.max[dim]);
      else next.max[dim] = Math.max(value, next.min[dim]);
      return next;
    });
  };

  const pickNode = (node: BkdNode) => {
    if (node.leaf !== null) {
      setInspected((now) => (now === node.id ? null : node.id));
      return;
    }
    const index = tree.steps.findIndex((step) => step.node.id === node.id);
    if (mode === "build" && index >= 0) {
      setPlaying(false);
      setBuildStep(index + 1);
    }
  };

  const caption = (() => {
    if (mode === "build") {
      if (!activeStep) return `One cell holds all ${tree.points.length} points — over the limit of ${leafSize}, so it splits.`;
      const moved = activeStep.leftCount + activeStep.rightCount;
      const where = hiddenSplit ? " (not on screen — pick it as an axis to see it)" : "";
      return `node ${activeStep.node.id} · split ${dimName(activeStep.dim)} at ${activeStep.split}${where} · ${moved} points → ${activeStep.leftCount} + ${activeStep.rightCount}`;
    }
    if (revealed === 0) return "Press play to walk the tree.";
    const visit = visits[revealed - 1];
    const name = visit.node.leaf !== null ? `leaf ${visit.node.leaf}` : `node ${visit.node.id}`;
    return `${name} · ${visit.verdict} · ${visit.action}`;
  })();

  const pointsRead = traversal.stats.pointsDecoded + traversal.stats.pointsBulk;
  const untouched = tree.points.length - pointsRead;
  const yTickLabel = (tick: number) =>
    ay === null ? String(Math.round((tick / SPACE) * (tree.points.length - 1))) : String(tick);

  return (
    <div className="viz" data-mode={mode}>
      <div className="viz-bar">
        <div className="viz-modes" role="tablist" aria-label="Stage">
          <button type="button" role="tab" aria-selected={mode === "build"} className={mode === "build" ? "is-active" : ""} title="How the tree gets built" onClick={() => { setMode("build"); setPlaying(false); }}>1 · Write the tree</button>
          <button type="button" role="tab" aria-selected={mode === "search"} className={mode === "search" ? "is-active" : ""} title="What a range query reads" onClick={() => { setMode("search"); setPlaying(false); }}>2 · Run a query</button>
        </div>

        {dims > 2 && (
          <div className="viz-axes">
            <label>
              <span>x</span>
              <select value={ax} onChange={(event) => setAxes({ x: Number(event.target.value), y: ay })}>
                {Array.from({ length: dims }, (_, dim) => <option key={dim} value={dim} disabled={dim === ay}>{dimName(dim)}</option>)}
              </select>
            </label>
            <label>
              <span>y</span>
              <select value={ay ?? 1} onChange={(event) => setAxes({ x: ax, y: Number(event.target.value) })}>
                {Array.from({ length: dims }, (_, dim) => <option key={dim} value={dim} disabled={dim === ax}>{dimName(dim)}</option>)}
              </select>
            </label>
          </div>
        )}

        <span className="viz-summary">{count} points · leaf {leafSize} · {dims}{dims === 1 ? " dim" : " dims"} · {shape}</span>
        <button type="button" className="viz-options" onClick={() => optionsRef.current?.showModal()}>⚙ options</button>
        <button type="button" className="viz-shuffle" title="New random data" onClick={() => setSeed(Math.floor(Math.random() * 1e9))}>↻</button>
      </div>

      <div className="viz-stage" ref={stageRef}>
        {dims > 1 && (
        <div className="viz-field-wrap" style={{ width: fieldPx }}>
          <div className="viz-field-box" style={{ width: fieldPx, height: fieldPx }}>
            <svg
              ref={fieldRef}
              className={`viz-field${mode === "search" ? " is-drawable" : ""}`}
              viewBox={`0 0 ${fieldSize} ${fieldSize}`}
              role="img"
              aria-label={mode === "build"
                ? `${tree.points.length} points partitioned into ${frontier.length} cells, projected on ${dimName(ax)} and ${ay === null ? "doc id" : dimName(ay)}`
                : `Range query over ${dims} dimensions, projected on ${dimName(ax)} and ${ay === null ? "doc id" : dimName(ay)}`}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <defs>
                <pattern id="viz-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="7" height="7" fill="#f4f1eb" />
                  <line x1="0" y1="0" x2="0" y2="7" stroke="#ddd6cb" strokeWidth="1.6" />
                </pattern>
              </defs>

              <rect className="viz-plot" x={fieldPad.left} y={fieldPad.top} width={fieldSize - fieldPad.left - fieldPad.right} height={fieldSize - fieldPad.top - fieldPad.bottom} />
              {ticks.map((tick) => (
                <g key={tick}>
                  <text className="viz-axis" x={fieldPad.left - 8} y={py(tick) + 3} textAnchor="end">{yTickLabel(tick)}</text>
                  <text className="viz-axis" x={px(tick)} y={fieldSize - fieldPad.bottom + 17} textAnchor="middle">{tick}</text>
                </g>
              ))}
              <text className="viz-axis-title" x={px(500)} y={fieldSize - 5} textAnchor="middle">{dimName(ax)}</text>
              <text className="viz-axis-title" transform={`translate(10 ${py(500)}) rotate(-90)`} textAnchor="middle">{ay === null ? "doc id" : dimName(ay)}</text>

              {mode === "build"
                ? frontier.map((node) => (
                  <rect
                    key={node.id}
                    className={`viz-cell viz-cell-${node.leaf !== null ? "leaf" : "open"}${hovered === node.id ? " is-hovered" : ""}${inspected === node.id ? " is-inspected" : ""}`}
                    {...cellRect(node)}
                    onPointerEnter={() => setHovered(node.id)}
                    onPointerLeave={() => setHovered(null)}
                    onClick={() => pickNode(node)}
                  />
                ))
                : (
                  <>
                    {traversal.cells.map(({ node, state }) => (
                      <rect key={node.id} className={`viz-cell viz-cell-${state}`} {...cellRect(node)} />
                    ))}
                    {tree.leaves.map((leaf) => (
                      <rect key={`outline-${leaf.id}`} className="viz-cell-outline" {...cellRect(leaf)} />
                    ))}
                  </>
                )}

              {splitNodes.map((node) => {
                if (node.dim === null || node.split === null) return null;
                const isNew = activeStep?.node.id === node.id;
                if (node.dim === ax) {
                  const top = ay === null ? py(SPACE) : py(node.cell.max[ay]);
                  const bottom = ay === null ? py(0) : py(node.cell.min[ay]);
                  return <line key={`line-${node.id}`} className={`viz-split${isNew ? " is-new" : ""}`} x1={px(node.split)} x2={px(node.split)} y1={top} y2={bottom} />;
                }
                if (ay !== null && node.dim === ay) {
                  return <line key={`line-${node.id}`} className={`viz-split${isNew ? " is-new" : ""}`} x1={px(node.cell.min[ax])} x2={px(node.cell.max[ax])} y1={py(node.split)} y2={py(node.split)} />;
                }
                return null;
              })}

              {hiddenSplit && activeStep && <rect className="viz-cell-offscreen" {...cellRect(activeStep.node)} />}
              {hoveredNode && <rect className="viz-cell-hover" {...cellRect(hoveredNode)} />}
              {mode === "search" && <rect className="viz-query" {...queryRect()} />}

              {tree.points.map((point) => {
                const state = mode === "search" ? traversal.pointStates[point.doc] ?? "idle" : "idle";
                const big = state === "match" || state === "bulk" || highlighted.has(point.doc);
                return (
                  <circle
                    key={point.doc}
                    className={`viz-point viz-point-${state}${highlighted.has(point.doc) ? " is-hovered" : ""}`}
                    cx={px(point.values[ax])}
                    cy={pointY(point)}
                    r={big ? 4.4 : 3.4}
                  />
                );
              })}
            </svg>
          </div>
          <p className="viz-hint">
            {mode === "build"
              ? "Click a cell to inspect its block · hover for its points."
              : "Drag anywhere on the field to draw a new range."}
            {offscreenSplits > 0 && (
              <b> · {offscreenSplits} of {tree.steps.length} splits are on hidden dimensions.</b>
            )}
          </p>
        </div>
        )}

        <div className="viz-right">
          <div className="viz-side">
            {mode === "search" && (
              <div className="viz-readout">
                <div className="viz-readout-main">
                  <span>Query</span>
                  <div className="viz-ranges">
                    {Array.from({ length: dims }, (_, dim) => (
                      <label key={dim} className="viz-range">
                        <b>{dimName(dim)}</b>
                        <input
                          type="number"
                          min={0}
                          max={SPACE}
                          step={50}
                          value={active.min[dim]}
                          aria-label={`${dimName(dim)} lower bound`}
                          onChange={(event) => setBound(dim, "min", event.target.value)}
                        />
                        <i>–</i>
                        <input
                          type="number"
                          min={0}
                          max={SPACE}
                          step={50}
                          value={active.max[dim]}
                          aria-label={`${dimName(dim)} upper bound`}
                          onChange={(event) => setBound(dim, "max", event.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
                <dl className="viz-readout-stats" aria-live="polite">
                  <div><dt>matching docs</dt><dd className="is-accent">{traversal.stats.matches}</dd></div>
                  <div><dt>read</dt><dd>{pointsRead}<small> / {tree.points.length}</small></dd></div>
                  <div><dt>never read</dt><dd>{untouched}<small> / {tree.points.length}</small></dd></div>
                </dl>
              </div>
            )}

            <ul className="viz-legend">
              {mode === "build" ? (
                <>
                  <li><i className="viz-swatch viz-swatch-open" />cell still over the leaf limit</li>
                  <li><i className="viz-swatch viz-swatch-leaf" />cell written as a leaf block</li>
                </>
              ) : (
                <>
                  <li><i className="viz-swatch viz-swatch-inside" />taken whole, values never compared</li>
                  <li><i className="viz-swatch viz-swatch-scan" />block decoded, points compared</li>
                  <li><i className="viz-swatch viz-swatch-outside" />pruned, never read</li>
                </>
              )}
            </ul>
          </div>

          <div className="viz-tree-wrap" ref={treeWrapRef}>
            <svg className="viz-tree" viewBox={`0 0 ${view.width} ${view.height}`} width={Math.round(view.width * treeScale)} height={Math.round(view.height * treeScale)} role="img" aria-label="BKD tree">
              {view.placed.map((item) => (
                [item.node.left, item.node.right]
                  .filter((child): child is BkdNode => Boolean(child && treeVisible.has(child.id)))
                  .map((child) => {
                    const target = view.placed.find((entry) => entry.node.id === child.id);
                    if (!target) return null;
                    const midY = item.y + view.nodeHeight / 2 + (target.y - view.nodeHeight - item.y) / 2;
                    return (
                      <path
                        key={`edge-${item.node.id}-${child.id}`}
                        className={`viz-edge viz-edge-${nodeState(child)}`}
                        d={`M${item.x},${item.y + view.nodeHeight / 2} L${item.x},${midY} L${target.x},${midY} L${target.x},${target.y - view.nodeHeight / 2}`}
                      />
                    );
                  })
              ))}

              {view.placed.map((item) => {
                const { node } = item;
                const state = nodeState(node);
                const isLeaf = node.leaf !== null;
                return (
                  <g
                    key={node.id}
                    className={`viz-node viz-node-${state}${hovered === node.id ? " is-hovered" : ""}${inspected === node.id ? " is-inspected" : ""}${activeStep?.node.id === node.id ? " is-active" : ""}`}
                    onPointerEnter={() => setHovered(node.id)}
                    onPointerLeave={() => setHovered(null)}
                    onClick={() => pickNode(node)}
                  >
                    <rect x={item.x - view.nodeWidth / 2} y={item.y - view.nodeHeight / 2} width={view.nodeWidth} height={view.nodeHeight} rx="3" />
                    {view.detail === 2 && (
                      <>
                        <text className="viz-node-title" x={item.x} y={item.y - 7}>{isLeaf ? `leaf ${node.leaf}` : `node ${node.id}`}</text>
                        <text className="viz-node-detail" x={item.x} y={item.y + 8}>{nodeDetail(node)}</text>
                        <text className="viz-node-foot" x={item.x} y={item.y + 20}>
                          {mode === "build"
                            ? done.has(node.id) || isLeaf ? "" : "over limit"
                            : verdictWord(state, isLeaf)}
                        </text>
                      </>
                    )}
                    {view.detail === 1 && (
                      <text className="viz-node-detail" x={item.x} y={item.y + 4}>{isLeaf ? `L${node.leaf}` : `d${node.dim}`}</text>
                    )}
                    <title>{isLeaf ? `leaf ${node.leaf} · ${node.points.length} points` : `node ${node.id} · ${dimName(node.dim ?? 0)} ${spanOf(node)} · splits at ${node.split} · ${node.points.length} points`}</title>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <div className="viz-transport">
        <button type="button" className="viz-play" onClick={() => { if (current >= total) setCurrent(0); setPlaying(!playing); }} aria-label={playing ? "Pause" : "Play"}>{playing ? "❙❙" : "▶"}</button>
        <button type="button" onClick={() => { setPlaying(false); setCurrent(Math.max(0, current - 1)); }} disabled={current === 0} aria-label="Previous step">←</button>
        <button type="button" onClick={() => { setPlaying(false); setCurrent(Math.min(total, current + 1)); }} disabled={current >= total} aria-label="Next step">→</button>
        <input
          className="viz-scrub"
          type="range"
          min={0}
          max={total}
          value={current}
          onChange={(event) => { setPlaying(false); setCurrent(Number(event.target.value)); }}
          aria-label={mode === "build" ? "Split number" : "Traversal step"}
        />
        <span className="viz-count">{current} / {total}</span>
        <p className="viz-caption">{caption}</p>
      </div>

      {inspectedNode && inspectedNode.leaf !== null && (
        <LeafInspector leaf={inspectedNode} dims={dims} dimName={dimName} onClose={() => setInspected(null)} />
      )}

      <dialog
        className="viz-modal"
        ref={optionsRef}
        onClick={(event) => { if (event.target === optionsRef.current) optionsRef.current?.close(); }}
      >
        <div className="viz-modal-inner">
          <header>
            <div>
              <span>options</span>
              <strong>Corpus and dimensions</strong>
            </div>
            <button type="button" onClick={() => optionsRef.current?.close()} aria-label="Close options">×</button>
          </header>

          <div className="viz-modal-body">
            <Param label="points">
              {counts.map((value) => (
                <button key={value} type="button" className={value === count ? "is-active" : ""} aria-pressed={value === count} onClick={() => setCount(value)}>{value}</button>
              ))}
            </Param>
            <Param label="maxPointsInLeafNode">
              {leafSizes.map((value) => (
                <button key={value} type="button" className={value === leafSize ? "is-active" : ""} aria-pressed={value === leafSize} onClick={() => setLeafSize(value)}>{value}</button>
              ))}
            </Param>
            <Param label="distribution">
              {shapes.map((item) => (
                <button key={item.id} type="button" className={item.id === shape ? "is-active" : ""} aria-pressed={item.id === shape} onClick={() => setShape(item.id)}>{item.label}</button>
              ))}
            </Param>
            <Param label="dimensions">
              {dimCounts.map((value) => (
                <button key={value} type="button" className={value === dims ? "is-active" : ""} aria-pressed={value === dims} onClick={() => setDims(value)}>{value}</button>
              ))}
            </Param>

            <div className="viz-modal-names">
              <span>dimension names</span>
              <div>
                {Array.from({ length: dims }, (_, dim) => (
                  <label key={dim}>
                    <b>{dim}</b>
                    <input
                      type="text"
                      value={names[dim]}
                      maxLength={14}
                      placeholder={`dim ${dim}`}
                      onChange={(event) => setNames((now) => now.map((name, index) => (index === dim ? event.target.value : name)))}
                    />
                  </label>
                ))}
              </div>
              <small>Used on the axes, in the tree, and in the query readout. Leave blank for <code>dim {"{n}"}</code>.</small>
            </div>

            <p className="viz-modal-note">
              With more than two dimensions the field shows a projection: the axes you pick, with every other dimension left unconstrained.
              Watch <em>blocks read</em> climb as dimensions go up — the tree spends its splits on dimensions your query does not narrow.
            </p>
          </div>

          <footer>
            <button type="button" className="viz-modal-reset" onClick={() => { setCount(64); setLeafSize(8); setDims(1); setShape("clustered"); setNames(Array.from({ length: MAX_DIMS }, () => "")); }}>reset to defaults</button>
            <button type="button" className="viz-modal-done" onClick={() => optionsRef.current?.close()}>done</button>
          </footer>
        </div>
      </dialog>
    </div>
  );
}

function verdictWord(state: string, isLeaf: boolean): string {
  switch (state) {
    case "split": return "split";
    case "frontier": return isLeaf ? "leaf block" : "";
    case "waiting": return "over limit";
    case "outside": return "skipped";
    case "pruned": return "never read";
    case "inside": return "taken whole";
    case "collected": return "doc IDs only";
    case "crosses": return "recurse";
    case "scan": return "decoded";
    default: return "";
  }
}

function Param({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="viz-param">
      <span>{label}</span>
      <div>{children}</div>
    </div>
  );
}

function LeafInspector({ leaf, dims, dimName, onClose }: { leaf: BkdNode; dims: number; dimName: (dim: number) => string; onClose: () => void }) {
  const sortDim = leafSortDim(leaf);
  const rows = leafPoints(leaf).map((point) => ({
    doc: point.doc,
    values: point.values,
    bytes: point.values.map((value) => sortableBytes(value)),
  }));
  const prefix = Array.from({ length: dims }, (_, dim) => sharedPrefixLength(rows.map((row) => row.bytes[dim])));
  const raw = rows.length * dims * 4;
  const packed = prefix.reduce((sum, length) => sum + length, 0) + rows.length * (dims * 4 - prefix.reduce((sum, length) => sum + length, 0));

  return (
    <div className="viz-leaf">
      <div className="viz-leaf-head">
        <div>
          <span>leaf block {leaf.leaf} · sorted by {dimName(sortDim)}</span>
          <strong>{rows.length} points as Lucene writes them</strong>
        </div>
        <button type="button" onClick={onClose} aria-label="Close block inspector">×</button>
      </div>
      <div className="viz-leaf-scroll">
        <table>
          <thead>
            <tr>
              <th>doc</th>
              {Array.from({ length: dims }, (_, dim) => (
                <Fragment key={dim}>
                  <th>{dimName(dim)}</th>
                  <th className="viz-leaf-packed">packed</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.doc}>
                <td className="viz-leaf-doc">{row.doc}</td>
                {Array.from({ length: dims }, (_, dim) => (
                  <Fragment key={dim}>
                    <td>{row.values[dim]}</td>
                    <td className="viz-leaf-bytes">
                      {row.bytes[dim].map((byte, index) => <span key={index} className={index < prefix[dim] ? "is-prefix" : ""}>{byte}</span>)}
                    </td>
                  </Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="viz-leaf-foot">
        Greyed bytes are the common prefix — stored once per block, not once per point.
        Values alone: <strong>{raw} B</strong> raw, <strong>{packed} B</strong> prefix-compressed.
      </p>
    </div>
  );
}
