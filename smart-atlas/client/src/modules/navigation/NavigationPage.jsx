import { useMemo, useState } from "react";
import FloorPlan from "./FloorPlan.jsx";
import { useElevatorData } from "./useElevatorData.js";
import { BLOCKS } from "./buildingData.js";
import { PLACES, placeById } from "./places.js";
import { buildGraph, describeRouteSteps, findRoute, levelLabel, nodeId, parseNode, placeLabel } from "./graph.js";
import "../facilities/facilities.css";
import "./navigation.css";

const BLOCK_KEYS = Object.keys(BLOCKS);
const GROUPS = [...new Set(PLACES.map((p) => p.group))];
const BUSY = new Set(["high", "very_high"]);
const CROWD_TEXT = { medium: "moderately busy", high: "busy", very_high: "very busy" };

// A place from the list, or "custom" = any block + level.
function PlacePicker({ label, value, onChange }) {
  const custom = value.placeId === "custom";
  const pick = (id) => {
    if (id === "custom") return onChange({ ...value, placeId: "custom" });
    const p = placeById(id);
    onChange({ placeId: id, block: p.block, level: p.level });
  };
  const levels = [...BLOCKS[value.block].levels].reverse();
  return (
    <fieldset className="nv-picker">
      <legend>{label}</legend>
      <select value={value.placeId} onChange={(e) => pick(e.target.value)} aria-label={`${label} place`}>
        {GROUPS.map((g) => (
          <optgroup key={g} label={g}>
            {PLACES.filter((p) => p.group === g).map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </optgroup>
        ))}
        <option value="custom">Other: choose block and floor…</option>
      </select>
      {custom && (
        <div className="nv-row">
          <select
            value={value.block}
            onChange={(e) => onChange({ placeId: "custom", block: e.target.value, level: BLOCKS[e.target.value].levels.includes("G") ? "G" : BLOCKS[e.target.value].levels[0] })}
            aria-label={`${label} block`}
          >
            {BLOCK_KEYS.map((b) => <option key={b} value={b}>Block {b}</option>)}
          </select>
          <select value={value.level} onChange={(e) => onChange({ ...value, level: e.target.value })} aria-label={`${label} floor`}>
            {levels.map((l) => <option key={l} value={l}>{levelLabel(l)}</option>)}
          </select>
        </div>
      )}
    </fieldset>
  );
}

export default function NavigationPage() {
  const { elevators, crowd, outIds, offline, stale } = useElevatorData();

  const [start, setStart] = useState({ placeId: "ENT-A", block: "A", level: "G" });
  const [end, setEnd] = useState({ placeId: "C5-03", block: "C", level: "5" });
  const [avoidStairs, setAvoidStairs] = useState(false);
  const [avoidCrowds, setAvoidCrowds] = useState(true);
  const [requested, setRequested] = useState(false); // after the first search the route follows live status changes
  const [view, setView] = useState({ block: "A", level: "G" });

  // The graph only depends on the elevator list's shape (ids, blocks, floors), not on status or crowd.
  const shape = elevators.map((e) => `${e.elevatorId}|${e.type}|${e.blocks?.[0]}|${e.floorFrom}|${e.floorTo}|${e.groupId}`).join(";");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const graph = useMemo(() => buildGraph(elevators), [shape]);

  const route = useMemo(() => {
    if (!requested) return undefined;
    return findRoute(graph, nodeId(start.block, start.level), nodeId(end.block, end.level), {
      outElevators: outIds,
      crowd,
      avoidStairs,
      avoidCrowds,
    });
  }, [requested, graph, start, end, outIds, crowd, avoidStairs, avoidCrowds]);

  const steps = useMemo(() => describeRouteSteps(route), [route]);
  const routeNodes = useMemo(() => new Set(route ? route.path : []), [route]);

  // "Crossing" labels shown on the floor currently displayed
  const notes = useMemo(() => {
    if (!route) return [];
    const out = [];
    route.edges.forEach((e, i) => {
      if (e.type !== "crossing") return;
      const a = parseNode(route.path[i]);
      const b = parseNode(route.path[i + 1]);
      if (a.block === view.block && a.level === view.level) out.push(`To Block ${b.block}, ${levelLabel(b.level)}`);
      else if (b.block === view.block && b.level === view.level) out.push(`From Block ${a.block}, ${levelLabel(a.level)}`);
    });
    return out;
  }, [route, view]);

  const find = () => {
    setRequested(true);
    setView({ block: start.block, level: start.level });
  };

  const brokenStudent = elevators.filter((e) => e.type === "student" && e.status !== "Working");
  const busyGroups = Object.entries(crowd).filter(([, lvl]) => BUSY.has(lvl));
  const levelsInView = [...BLOCKS[view.block].levels].reverse();

  return (
    <div>
      <h2 className="page-title">Smart Navigation</h2>
      <p className="hint">Routes avoid elevators that are out of service. The route updates by itself when an elevator status changes.</p>

      {offline && <div className="alert">Server not reachable: using the built-in demo elevator list (statuses will not change).</div>}
      {stale && <div className="alert">Connection lost: showing the last known elevator status.</div>}

      <section className="card">
        <div className="nv-controls">
          <PlacePicker label="From" value={start} onChange={setStart} />
          <PlacePicker label="To" value={end} onChange={setEnd} />
          <div>
            <label className="check">
              <input type="checkbox" checked={avoidStairs} onChange={(e) => setAvoidStairs(e.target.checked)} />
              Avoid stairs (accessible route)
            </label>
            <label className="check">
              <input type="checkbox" checked={avoidCrowds} onChange={(e) => setAvoidCrowds(e.target.checked)} />
              Prefer less crowded elevators
            </label>
            <button className="primary" onClick={find}>Find route</button>
          </div>
        </div>
        {(brokenStudent.length > 0 || busyGroups.length > 0) && (
          <p className="hint">
            {brokenStudent.length > 0 && <>Not used in routes: {brokenStudent.map((e) => `${e.elevatorId} (${e.status})`).join(", ")}. </>}
            {busyGroups.length > 0 && <>Busy groups: {busyGroups.map(([g, l]) => `${g} (${CROWD_TEXT[l]})`).join(", ")}.</>}
          </p>
        )}
      </section>

      <div className="nv-layout">
        <section className="card">
          <div className="tabs small" role="tablist" aria-label="Block">
            {BLOCK_KEYS.map((b) => (
              <button
                key={b}
                role="tab"
                aria-selected={view.block === b}
                className={view.block === b ? "tab active" : "tab"}
                onClick={() => setView({ block: b, level: BLOCKS[b].levels.includes(view.level) ? view.level : BLOCKS[b].levels.includes("G") ? "G" : BLOCKS[b].levels[0] })}
              >
                Block {b}
              </button>
            ))}
            <select className="nv-level" value={view.level} onChange={(e) => setView({ ...view, level: e.target.value })} aria-label="Floor shown on the map">
              {levelsInView.map((l) => <option key={l} value={l}>{levelLabel(l)}</option>)}
            </select>
          </div>
          <FloorPlan block={view.block} level={view.level} elevators={elevators} crowd={crowd} routeNodes={routeNodes} notes={notes} />
        </section>

        <section className="card">
          <h2>Route</h2>
          {route === undefined && <p className="hint">Choose where you are and where you are going, then press “Find route”.</p>}
          {route === null && (
            <p className="message error">
              No route with the current elevator status{avoidStairs ? " (stairs are switched off)" : ""}. Try turning off “Avoid stairs”.
            </p>
          )}
          {route && steps.length === 0 && <p className="hint">You are already there.</p>}
          {route && steps.length > 0 && (
            <ol className="nv-steps">
              {steps.map((s, i) => (
                <li key={i}>
                  <button className="nv-step" onClick={() => setView({ block: s.from.block, level: s.from.level })}>{s.text}</button>
                  {s.type === "elevator" && crowd[s.groupId] && crowd[s.groupId] !== "low" && (
                    <span className={`chip ${BUSY.has(crowd[s.groupId]) ? "bad" : "warn"}`}>{CROWD_TEXT[crowd[s.groupId]]}</span>
                  )}
                  {s.service && <span className="chip warn">service stairs</span>}
                </li>
              ))}
            </ol>
          )}
          {route && (
            <p className="hint">
              {placeLabel(start.block, start.level)} → {placeLabel(end.block, end.level)}. Click a step to see that floor.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
