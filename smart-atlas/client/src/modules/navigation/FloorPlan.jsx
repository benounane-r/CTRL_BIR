import { nodeId, levelLabel, servesLevel, stairsAt } from "./graph.js";

const LIFT_W = 48;
const LIFT_GAP = 8;

// One generic floor template: lobby in the middle, staircases on the left, the elevators that stop here on the right.
// Anything the current route passes through on this block + level is highlighted.
export default function FloorPlan({ block, level, elevators, crowd, routeNodes, notes }) {
  const stairs = stairsAt(block, level);
  const lifts = elevators.filter((e) => servesLevel(e, block, level));
  const used = (kind) => routeNodes.has(nodeId(block, level, kind));

  const liftState = (e) => {
    if (e.status !== "Working") return { cls: "down", text: e.status === "Under Maintenance" ? "MAINT" : "OUT" };
    if (e.type !== "student") return { cls: "staff", text: "staff" };
    if (crowd[e.groupId] === "high" || crowd[e.groupId] === "very_high") return { cls: "busy", text: "busy" };
    return { cls: "up", text: "OK" };
  };

  return (
    <svg viewBox="0 0 720 280" role="img" aria-label={`Block ${block}, ${levelLabel(level)}`} className="nv-plan">
      <rect x="8" y="8" width="704" height="264" rx="14" className="nv-plan-bg" />
      <text x="26" y="40" className="nv-plan-title">
        Block {block} · {levelLabel(level)}
      </text>

      <rect x="40" y="125" width="640" height="20" rx="10" className="nv-plan-corridor" />

      {stairs.map((s, i) => {
        const x = 236 - i * 70;
        return (
          <g key={s.id}>
            <line x1="330" y1="135" x2={x + 26} y2="135" className="nv-plan-link" />
            <rect x={x} y="100" width="52" height="70" rx="8" className={`nv-plan-stairs ${used(`stairs-${s.id}`) ? "used" : ""}`} />
            <text x={x + 26} y="130" textAnchor="middle" className="nv-plan-label">Stairs</text>
            <text x={x + 26} y="148" textAnchor="middle" className="nv-plan-sub">{s.service ? "service" : "main"}</text>
          </g>
        );
      })}

      {lifts.map((e, i) => {
        const x = 420 + i * (LIFT_W + LIFT_GAP);
        const st = liftState(e);
        return (
          <g key={e.elevatorId}>
            <line x1="330" y1="135" x2={x + LIFT_W / 2} y2="135" className="nv-plan-link" />
            <rect x={x} y="100" width={LIFT_W} height="70" rx="8" className={`nv-plan-lift ${st.cls} ${used(e.elevatorId) ? "used" : ""}`} />
            <text x={x + LIFT_W / 2} y="130" textAnchor="middle" className="nv-plan-label small">{e.elevatorId}</text>
            <text x={x + LIFT_W / 2} y="148" textAnchor="middle" className="nv-plan-sub">{st.text}</text>
          </g>
        );
      })}

      <circle cx="330" cy="135" r="26" className={`nv-plan-lobby ${used("lobby") ? "used" : ""}`} />
      <text x="330" y="140" textAnchor="middle" className="nv-plan-label">Lobby</text>

      {block === "C" && (
        <text x="26" y="64" className="nv-plan-sub">Block C is served by the B/C triple elevators in Block B.</text>
      )}
      {lifts.length === 0 && block !== "C" && (
        <text x="420" y="140" className="nv-plan-sub">No student elevator stops here</text>
      )}

      {notes.map((n, i) => (
        <g key={n}>
          <rect x="200" y={196 + i * 30} width="260" height="24" rx="12" className="nv-plan-cross" />
          <text x="330" y={212 + i * 30} textAnchor="middle" className="nv-plan-sub strong">{n}</text>
        </g>
      ))}
    </svg>
  );
}
