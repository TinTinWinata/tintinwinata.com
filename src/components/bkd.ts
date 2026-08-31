/* A miniature, faithful model of Lucene's BKD tree.
 *
 * Everything is parameterised so the visualization can rebuild the whole
 * structure when the reader changes the corpus, the leaf size or the shape of
 * the data. The rules copied from Lucene: split the dimension in which the
 * node's own cell is widest (BKDWriter.split compares maxPackedValue minus
 * minPackedValue per dimension), split at the median of the points inside it,
 * bound child cells with the split value, and number nodes implicitly so the
 * root is 1 and node n's children are 2n and 2n+1.
 */

export const SPACE = 1000;
export const MAX_DIMS = 4;

export type Dim = number;
export type Point = { doc: number; values: number[] };
export type Cell = { min: number[]; max: number[] };

export type BkdNode = {
  id: number;
  depth: number;
  cell: Cell;
  points: Point[];
  leaf: number | null;
  dim: Dim | null;
  split: number | null;
  left: BkdNode | null;
  right: BkdNode | null;
  parent: BkdNode | null;
};

export type Shape = "clustered" | "uniform" | "correlated";

export type TreeConfig = {
  count: number;
  leafSize: number;
  shape: Shape;
  seed: number;
  dims: number;
};

export type BuildStep = {
  node: BkdNode;
  dim: Dim;
  split: number;
  leftCount: number;
  rightCount: number;
};

export type Tree = {
  config: TreeConfig;
  points: Point[];
  root: BkdNode;
  nodes: BkdNode[];
  leaves: BkdNode[];
  depth: number;
  steps: BuildStep[];
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Every point is always generated with MAX_DIMS coordinates and then sliced to
   the requested count. That keeps dimension 0 (and 1, and 2) identical as the
   reader steps 1 → 2 → 3 → 4 dimensions, so the progression reads as the same
   corpus gaining a dimension rather than a whole new dataset each time.
   Values are kept distinct within a dimension, which is what makes the median
   split unambiguous and every leaf exactly the same size. */
function makePoints(config: TreeConfig): Point[] {
  const random = mulberry32(config.seed);
  const bell = () => (random() + random() + random() + random() - 2) / 1.4;
  const centres = Array.from({ length: 4 }, () =>
    Array.from({ length: MAX_DIMS }, () => 140 + random() * (SPACE - 280)));
  const used = Array.from({ length: MAX_DIMS }, () => new Set<number>());

  const settle = (dim: number, value: number) => {
    let candidate = Math.max(12, Math.min(SPACE - 12, Math.round(value)));
    let step = 1;
    while (used[dim].has(candidate)) {
      candidate = Math.max(12, Math.min(SPACE - 12, candidate + step));
      step = step > 0 ? -(step + 1) : -(step - 1);
    }
    used[dim].add(candidate);
    return candidate;
  };

  return Array.from({ length: config.count }, (_, doc) => {
    const centre = centres[doc % centres.length];
    const along = random();
    const values = Array.from({ length: MAX_DIMS }, (_, dim) => {
      if (config.shape === "uniform") return settle(dim, random() * SPACE);
      if (config.shape === "correlated") return settle(dim, along * SPACE + bell() * 70);
      /* Every fifth point is background noise so the clusters have a floor. */
      return doc % 5 === 4
        ? settle(dim, random() * SPACE)
        : settle(dim, centre[dim] + bell() * 105);
    });
    return { doc, values: values.slice(0, config.dims) };
  });
}

const boundsOf = (list: Point[], dims: number): Cell => ({
  min: Array.from({ length: dims }, (_, dim) => Math.min(...list.map((point) => point.values[dim]))),
  max: Array.from({ length: dims }, (_, dim) => Math.max(...list.map((point) => point.values[dim]))),
});

const widestDim = (cell: Cell): Dim => {
  let best = 0;
  for (let dim = 1; dim < cell.min.length; dim += 1) {
    if (cell.max[dim] - cell.min[dim] > cell.max[best] - cell.min[best]) best = dim;
  }
  return best;
};

export function createTree(config: TreeConfig): Tree {
  const points = makePoints(config);
  const nodes: BkdNode[] = [];
  const leaves: BkdNode[] = [];
  const steps: BuildStep[] = [];
  let leafCounter = 0;

  const build = (list: Point[], cell: Cell, depth: number, id: number, parent: BkdNode | null): BkdNode => {
    const node: BkdNode = { id, depth, cell, points: list, leaf: null, dim: null, split: null, left: null, right: null, parent };
    nodes.push(node);

    if (list.length <= config.leafSize) {
      node.leaf = leafCounter++;
      leaves.push(node);
      return node;
    }

    const dim = widestDim(cell);
    const sorted = [...list].sort((a, b) => a.values[dim] - b.values[dim]);
    const mid = sorted.length >> 1;
    const split = sorted[mid].values[dim];

    const leftCell: Cell = { min: [...cell.min], max: [...cell.max] };
    leftCell.max[dim] = split;
    const rightCell: Cell = { min: [...cell.min], max: [...cell.max] };
    rightCell.min[dim] = split;

    node.dim = dim;
    node.split = split;
    /* Recorded before recursing, so the step list reads in the same pre-order
       the writer actually walks. */
    steps.push({ node, dim, split, leftCount: mid, rightCount: sorted.length - mid });
    node.left = build(sorted.slice(0, mid), leftCell, depth + 1, id * 2, node);
    node.right = build(sorted.slice(mid), rightCell, depth + 1, id * 2 + 1, node);
    return node;
  };

  const root = build(points, boundsOf(points, config.dims), 0, 1, null);
  leaves.sort((a, b) => (a.leaf ?? 0) - (b.leaf ?? 0));

  return {
    config,
    points,
    root,
    nodes,
    leaves,
    depth: Math.max(...nodes.map((node) => node.depth)),
    steps,
  };
}

/* Which nodes exist on screen after the first `done` splits have run. */
export function visibleAfter(tree: Tree, done: number): Set<number> {
  const visible = new Set<number>([tree.root.id]);
  tree.steps.slice(0, done).forEach((step) => {
    if (step.node.left) visible.add(step.node.left.id);
    if (step.node.right) visible.add(step.node.right.id);
  });
  return visible;
}

export const splitsDone = (tree: Tree, done: number) => new Set(tree.steps.slice(0, done).map((step) => step.node.id));

export type Axes = { x: number; y: number | null };

export const fullQuery = (dims: number): Query => ({
  min: Array.from({ length: dims }, () => 0),
  max: Array.from({ length: dims }, () => SPACE),
});

/* Presets constrain only the two projected dimensions. Everything hidden stays
   at full range, so what is on screen always explains the verdict. */
export function presetQueries(tree: Tree, axes: Axes): Array<{ name: string; query: Query }> {
  const dims = tree.config.dims;
  const build = (spans: Array<[number, [number, number]]>): Query => {
    const query = fullQuery(dims);
    spans.forEach(([dim, [low, high]]) => {
      query.min[dim] = low;
      query.max[dim] = high;
    });
    return query;
  };

  const middle = tree.leaves[Math.floor(tree.leaves.length / 2)].cell;
  const inset = (dim: number): [number, number] => {
    const pad = (middle.max[dim] - middle.min[dim]) * 0.14;
    return [Math.round(middle.min[dim] + pad), Math.round(middle.max[dim] - pad)];
  };

  const both = (low: [number, number], high: [number, number]): Array<[number, [number, number]]> =>
    axes.y === null ? [[axes.x, low]] : [[axes.x, low], [axes.y, high]];

  return [
    { name: "box", query: build(both([60, 700], [20, 400])) },
    { name: "band", query: build([[axes.x, [80, 460]]]) },
    { name: "narrow", query: build(axes.y === null ? [[axes.x, inset(axes.x)]] : [[axes.x, inset(axes.x)], [axes.y, inset(axes.y)]]) },
    { name: "everything", query: fullQuery(dims) },
  ];
}

/* Points inside a leaf are stored sorted by the dimension its cell was last
   split on, which is what makes the shared byte prefix pay off. */
export function leafSortDim(leaf: BkdNode): Dim {
  let node: BkdNode | null = leaf.parent;
  while (node) {
    if (node.dim !== null) return node.dim;
    node = node.parent;
  }
  return 0;
}

export function leafPoints(leaf: BkdNode): Point[] {
  const dim = leafSortDim(leaf);
  return [...leaf.points].sort((a, b) => a.values[dim] - b.values[dim]);
}

/* Lucene encodes an int as 4 big-endian bytes with the sign bit flipped, so an
   unsigned byte comparison gives the same order as a numeric one. */
export function sortableBytes(value: number): string[] {
  const flipped = (value ^ 0x80000000) >>> 0;
  return [24, 16, 8, 0].map((shift) => ((flipped >>> shift) & 0xff).toString(16).padStart(2, "0").toUpperCase());
}

export function sharedPrefixLength(rows: string[][]): number {
  if (rows.length === 0) return 0;
  let shared = 0;
  while (shared < 4 && rows.every((row) => row[shared] === rows[0][shared])) shared += 1;
  return shared;
}

export type Query = { min: number[]; max: number[] };
export type Relation = "inside" | "outside" | "crosses";

export function relate(cell: Cell, query: Query): Relation {
  for (let dim = 0; dim < cell.min.length; dim += 1) {
    if (cell.min[dim] > query.max[dim] || cell.max[dim] < query.min[dim]) return "outside";
  }
  for (let dim = 0; dim < cell.min.length; dim += 1) {
    if (cell.min[dim] < query.min[dim] || cell.max[dim] > query.max[dim]) return "crosses";
  }
  return "inside";
}

export const contains = (point: Point, query: Query) =>
  point.values.every((value, dim) => value >= query.min[dim] && value <= query.max[dim]);

export type NodeState = "idle" | "outside" | "pruned" | "inside" | "collected" | "crosses" | "scan";
export type PointState = "idle" | "skipped" | "bulk" | "checked" | "match";

export type Stats = {
  comparisons: number;
  leafBlocksScanned: number;
  leafBlocksBulk: number;
  leafBlocksSkipped: number;
  pointsDecoded: number;
  pointsBulk: number;
  pointsSkipped: number;
  matches: number;
  subtreesSkipped: number;
};

const emptyStats = (): Stats => ({
  comparisons: 0,
  leafBlocksScanned: 0,
  leafBlocksBulk: 0,
  leafBlocksSkipped: 0,
  pointsDecoded: 0,
  pointsBulk: 0,
  pointsSkipped: 0,
  matches: 0,
  subtreesSkipped: 0,
});

export type Visit = {
  node: BkdNode;
  relation: Relation;
  verdict: string;
  action: string;
  nodeStates: Array<[number, NodeState]>;
  pointStates: Array<[number, PointState]>;
  stats: Partial<Stats>;
  terminal: boolean;
};

const descendants = (node: BkdNode): BkdNode[] => {
  const out: BkdNode[] = [];
  const walk = (current: BkdNode) => {
    if (current.left) { out.push(current.left); walk(current.left); }
    if (current.right) { out.push(current.right); walk(current.right); }
  };
  walk(node);
  return out;
};

const leafCount = (node: BkdNode) =>
  (node.leaf !== null ? 1 : 0) + descendants(node).filter((child) => child.leaf !== null).length;

/* Mirrors BKDReader.intersect: compare the node's cell with the query, then
   skip the subtree, bulk-collect it, or recurse. */
export function intersect(tree: Tree, query: Query): Visit[] {
  const visits: Visit[] = [];

  const step = (node: BkdNode) => {
    const relation = relate(node.cell, query);
    const isLeaf = node.leaf !== null;
    const blocks = leafCount(node);

    if (relation === "outside") {
      visits.push({
        node,
        relation,
        verdict: "CELL_OUTSIDE_QUERY",
        action: isLeaf ? "skip this block" : `skip ${blocks} blocks · ${node.points.length} points`,
        nodeStates: [[node.id, "outside"], ...descendants(node).map((child): [number, NodeState] => [child.id, "pruned"])],
        pointStates: node.points.map((point): [number, PointState] => [point.doc, "skipped"]),
        stats: { comparisons: 1, subtreesSkipped: 1, leafBlocksSkipped: blocks, pointsSkipped: node.points.length },
        terminal: true,
      });
      return;
    }

    if (relation === "inside") {
      visits.push({
        node,
        relation,
        verdict: "CELL_INSIDE_QUERY",
        action: `take ${node.points.length} doc IDs · no value comparisons`,
        nodeStates: [[node.id, "inside"], ...descendants(node).map((child): [number, NodeState] => [child.id, "collected"])],
        pointStates: node.points.map((point): [number, PointState] => [point.doc, "bulk"]),
        stats: { comparisons: 1, leafBlocksBulk: blocks, pointsBulk: node.points.length, matches: node.points.length },
        terminal: true,
      });
      return;
    }

    if (isLeaf) {
      const matched = node.points.filter((point) => contains(point, query)).length;
      visits.push({
        node,
        relation,
        verdict: "CELL_CROSSES_QUERY",
        action: `decode ${node.points.length} points · ${matched} match`,
        nodeStates: [[node.id, "scan"]],
        pointStates: node.points.map((point): [number, PointState] => [point.doc, contains(point, query) ? "match" : "checked"]),
        stats: { comparisons: 1, leafBlocksScanned: 1, pointsDecoded: node.points.length, matches: matched },
        terminal: true,
      });
      return;
    }

    visits.push({
      node,
      relation,
      verdict: "CELL_CROSSES_QUERY",
      action: "recurse into both children",
      nodeStates: [[node.id, "crosses"]],
      pointStates: [],
      stats: { comparisons: 1 },
      terminal: false,
    });
    if (node.left) step(node.left);
    if (node.right) step(node.right);
  };

  step(tree.root);
  return visits;
}

export type Traversal = {
  nodeStates: Record<number, NodeState>;
  pointStates: Record<number, PointState>;
  stats: Stats;
  cells: Array<{ node: BkdNode; state: NodeState }>;
};

export function fold(visits: Visit[], count: number): Traversal {
  const nodeStates: Record<number, NodeState> = {};
  const pointStates: Record<number, PointState> = {};
  const stats = emptyStats();
  const cells: Array<{ node: BkdNode; state: NodeState }> = [];

  visits.slice(0, count).forEach((visit) => {
    visit.nodeStates.forEach(([id, state]) => { nodeStates[id] = state; });
    visit.pointStates.forEach(([doc, state]) => { pointStates[doc] = state; });
    (Object.keys(visit.stats) as Array<keyof Stats>).forEach((key) => { stats[key] += visit.stats[key] ?? 0; });
    if (visit.terminal) cells.push({ node: visit.node, state: nodeStates[visit.node.id] ?? "idle" });
  });

  return { nodeStates, pointStates, stats, cells };
}

/* Tree geometry. Node boxes and row heights shrink as the tree widens, so a
   32-leaf tree still reads as a shape once the labels no longer fit. The
   diagram is sized in real pixels and scrolls rather than scaling, which keeps
   a deep tree from stretching to the height of the page. */
export const minTreeWidth = 820;
export const slotFloor = 34;

export type PlacedNode = { node: BkdNode; x: number; y: number; frontier: boolean };
export type TreeLayout = {
  placed: PlacedNode[];
  width: number;
  height: number;
  nodeWidth: number;
  nodeHeight: number;
  detail: 0 | 1 | 2;
};

export function layout(tree: Tree, visible: Set<number>): TreeLayout {
  const shown = tree.nodes.filter((node) => visible.has(node.id));
  const isFrontier = (node: BkdNode) =>
    !((node.left && visible.has(node.left.id)) || (node.right && visible.has(node.right.id)));
  const frontier = shown.filter(isFrontier);

  const width = Math.max(minTreeWidth, frontier.length * slotFloor);
  const slot = width / Math.max(1, frontier.length);
  const nodeWidth = Math.max(18, Math.min(112, slot - 8));
  const detail: 0 | 1 | 2 = nodeWidth >= 76 ? 2 : nodeWidth >= 34 ? 1 : 0;
  const nodeHeight = detail === 2 ? 44 : detail === 1 ? 30 : 16;
  const rowHeight = detail === 2 ? 64 : detail === 1 ? 50 : 36;

  const x = new Map<number, number>();
  frontier.forEach((node, index) => x.set(node.id, (index + 0.5) * slot));
  [...shown].sort((a, b) => b.depth - a.depth).forEach((node) => {
    if (x.has(node.id)) return;
    const kids = [node.left, node.right].filter((child) => child && visible.has(child.id)) as BkdNode[];
    const positions = kids.map((child) => x.get(child.id) ?? width / 2);
    x.set(node.id, positions.length ? (Math.min(...positions) + Math.max(...positions)) / 2 : width / 2);
  });

  const maxDepth = Math.max(...shown.map((node) => node.depth));
  return {
    placed: shown.map((node) => ({
      node,
      x: x.get(node.id) ?? width / 2,
      y: nodeHeight / 2 + 8 + node.depth * rowHeight,
      frontier: isFrontier(node),
    })),
    width,
    height: nodeHeight + 16 + maxDepth * rowHeight,
    nodeWidth,
    nodeHeight,
    detail,
  };
}

/* Field geometry for the scatter plot. */
export const fieldSize = 520;
export const fieldPad = { left: 40, top: 16, right: 14, bottom: 36 };
const plotSpan = fieldSize - fieldPad.left - fieldPad.right;

export const px = (value: number) => fieldPad.left + (value / SPACE) * plotSpan;
export const py = (value: number) => fieldPad.top + (1 - value / SPACE) * plotSpan;
export const unpx = (pixel: number) => Math.round(((pixel - fieldPad.left) / plotSpan) * SPACE);
export const unpy = (pixel: number) => Math.round((1 - (pixel - fieldPad.top) / plotSpan) * SPACE);
export const clampValue = (value: number) => Math.max(0, Math.min(SPACE, value));
export const ticks = [0, 250, 500, 750, 1000];
