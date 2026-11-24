// graph.js - builds the campus graph and finds routes (Dijkstra).
// The building comes from buildingData.js; elevators come from Irem's API (or the offline snapshot).
import {
  BLOCKS,
  STAIRS,
  CROSSINGS,
  COST,
  CROWD_PENALTY,
  ELEVATORS_STOP_AT_GROUND,
  STUDENTS_MAY_USE_SERVICE_STAIRS,
} from "./buildingData.js";

// ---------- helpers ----------
export const nodeId = (block, level, kind = "lobby") => `${block}:${level}:${kind}`;

export function parseNode(id) {
  const [block, level, ...rest] = id.split(":");
  return { block, level, kind: rest.join(":") };
}

export function levelLabel(level) {
  if (level === "G") return "ground floor";
  if (level === "A") return "floor A";
  return `floor ${level}`;
}
export const placeLabel = (block, level) => `Block ${block}, ${levelLabel(level)}`;

const isNumeric = (l) => /^\d+$/.test(l);

// Block whose shaft we draw the elevator in (the triple B/C elevators are drawn in B).
export const shaftBlock = (e) => (e.blocks && e.blocks[0]) || null;

// Which levels of its block does this elevator stop at? (Irem stores a numeric range.)
export function servedLevels(e) {
  const block = shaftBlock(e);
  if (!BLOCKS[block] || e.floorFrom == null || e.floorTo == null) return [];
  const levels = BLOCKS[block].levels;
  const stopsAtGround = ELEVATORS_STOP_AT_GROUND && e.floorFrom === 1 && levels.includes("G");
  return levels.filter(
    (l) => (isNumeric(l) && Number(l) >= e.floorFrom && Number(l) <= e.floorTo) || (stopsAtGround && l === "G")
  );
}
export const servesLevel = (e, block, level) => shaftBlock(e) === block && servedLevels(e).includes(level);

export function stairsAt(block, level) {
  const levels = BLOCKS[block].levels;
  const i = levels.indexOf(level);
  return STAIRS.filter((s) => s.block === block && levels.indexOf(s.from) <= i && i <= levels.indexOf(s.to));
}

// ---------- build ----------
export function buildGraph(elevators = []) {
  const edges = [];
  const add = (from, to, w, type, meta = {}) => edges.push({ from, to, w, type, ...meta });
  const both = (a, b, w, type, metaAB = {}, metaBA = metaAB) => {
    add(a, b, w, type, metaAB);
    add(b, a, w, type, metaBA);
  };

  // stairs
  for (const s of STAIRS) {
    const levels = BLOCKS[s.block].levels;
    const i0 = levels.indexOf(s.from);
    const i1 = levels.indexOf(s.to);
    for (let i = i0; i <= i1; i++) {
      const lobby = nodeId(s.block, levels[i]);
      const node = nodeId(s.block, levels[i], `stairs-${s.id}`);
      both(lobby, node, COST.stairsAccess, "access");
      if (i < i1) {
        const next = nodeId(s.block, levels[i + 1], `stairs-${s.id}`);
        both(node, next, s.service ? COST.serviceStairsStep : COST.stairsStep, "stairs", { stairsId: s.id, service: s.service });
      }
    }
  }

  // elevators
  for (const e of elevators) {
    const block = shaftBlock(e);
    const served = servedLevels(e);
    const meta = { elevatorId: e.elevatorId, groupId: e.groupId, elevatorType: e.type };
    served.forEach((level, i) => {
      const lobby = nodeId(block, level);
      const node = nodeId(block, level, e.elevatorId);
      both(lobby, node, COST.access, "access", { ...meta, board: true }, meta); // crowd penalty only when boarding
      if (i < served.length - 1) both(node, nodeId(block, served[i + 1], e.elevatorId), COST.elevatorStep, "elevator", meta);
    });
  }

  // block-to-block crossings
  for (const [b1, l1, b2, l2] of CROSSINGS) {
    if (!BLOCKS[b1]?.levels.includes(l1) || !BLOCKS[b2]?.levels.includes(l2)) {
      console.warn("Bad crossing in buildingData.js:", b1, l1, b2, l2);
      continue;
    }
    both(nodeId(b1, l1), nodeId(b2, l2), COST.crossing, "crossing");
  }

  const adj = new Map();
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from).push(e);
  }
  return { edges, adj };
}

// ---------- Dijkstra ----------
// options:
//   outElevators  ids that are Out of Service / Under Maintenance
//   avoidStairs   accessible route (no stairs at all)
//   crowd         { groupId: "low" | "medium" | "high" | "very_high" }
//   avoidCrowds   add the crowd penalty (default true)
//   allowStaff    allow staff elevators (default false: students only)
export function findRoute(graph, start, end, options = {}) {
  const { outElevators = [], avoidStairs = false, crowd = {}, avoidCrowds = true, allowStaff = false } = options;
  const blocked = new Set(outElevators);

  const usable = (e) => {
    if (e.elevatorId) {
      if (blocked.has(e.elevatorId)) return false;
      if (e.elevatorType !== "student" && !(allowStaff && e.elevatorType === "staff")) return false;
    }
    if (avoidStairs && e.type === "stairs") return false;
    if (e.service && !STUDENTS_MAY_USE_SERVICE_STAIRS) return false;
    return true;
  };
  const weight = (e) => e.w + (avoidCrowds && e.board ? CROWD_PENALTY[crowd[e.groupId]] || 0 : 0);

  if (!graph.adj.has(start) || !graph.adj.has(end)) return null;

  const dist = new Map([[start, 0]]);
  const prev = new Map();
  const done = new Set();
  const queue = [start]; // a few hundred nodes at most, a simple list is fast enough

  while (queue.length) {
    let best = 0;
    for (let i = 1; i < queue.length; i++) if (dist.get(queue[i]) < dist.get(queue[best])) best = i;
    const u = queue.splice(best, 1)[0];
    if (done.has(u)) continue;
    done.add(u);
    if (u === end) break;
    for (const e of graph.adj.get(u) || []) {
      if (!usable(e)) continue;
      const nd = dist.get(u) + weight(e);
      if (nd < (dist.get(e.to) ?? Infinity)) {
        dist.set(e.to, nd);
        prev.set(e.to, { node: u, edge: e });
        queue.push(e.to);
      }
    }
  }

  if (!dist.has(end)) return null; // no route with the current elevator status

  const path = [end];
  const used = [];
  for (let n = end; n !== start; ) {
    const p = prev.get(n);
    used.unshift(p.edge);
    path.unshift(p.node);
    n = p.node;
  }
  return { path, edges: used, cost: dist.get(end) };
}

// ---------- readable steps for the UI ----------
// Short walks inside a lobby ("access" edges) are not shown as steps.
export function describeRouteSteps(route) {
  if (!route) return [];
  const { path, edges } = route;
  const steps = [];
  let i = 0;
  while (i < edges.length) {
    const e = edges[i];
    if (e.type === "access") {
      i++;
      continue;
    }
    // consecutive floors of the same elevator/staircase become one step; every block crossing is its own step
    const sameRun = (x) => e.type !== "crossing" && x.type === e.type && x.elevatorId === e.elevatorId && x.stairsId === e.stairsId;
    let j = i;
    while (j + 1 < edges.length && sameRun(edges[j + 1])) j++;
    const from = parseNode(path[i]);
    const to = parseNode(path[j + 1]);
    let text;
    if (e.type === "elevator") {
      text = `Take elevator ${e.elevatorId} (Block ${from.block}) from ${levelLabel(from.level)} to ${levelLabel(to.level)}`;
    } else if (e.type === "stairs") {
      text = `Take the ${e.service ? "service stairs" : "stairs"} in Block ${from.block} from ${levelLabel(from.level)} to ${levelLabel(to.level)}`;
    } else {
      text = `Walk from ${placeLabel(from.block, from.level)} across to ${placeLabel(to.block, to.level)}`;
    }
    steps.push({ type: e.type, text, from, to, elevatorId: e.elevatorId, groupId: e.groupId, service: !!e.service });
    i = j + 1;
  }
  return steps;
}
