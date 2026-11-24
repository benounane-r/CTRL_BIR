import { getRooms, getClassrooms, getElevatorGroups } from "../facilities/api.js";
import { usePolling } from "../facilities/hooks.js";
import { useElevatorData } from "../navigation/useElevatorData.js";
import "../facilities/facilities.css";
import "./dashboard.css";

// Büşra's library server runs on its own port (3001) and keeps reservations in memory.
async function getLibraryReservations() {
  const res = await fetch(`http://${window.location.hostname}:3001/api/reservations`);
  if (!res.ok) throw new Error("library server error");
  return res.json();
}

function Stat({ title, value, sub, tone, onClick }) {
  return (
    <button className={`dash-stat ${tone}`} onClick={onClick}>
      <span className="dash-stat-title">{title}</span>
      <span className="dash-stat-value">{value}</span>
      <span className="dash-stat-sub">{sub}</span>
    </button>
  );
}

export default function DashboardPage({ go }) {
  const { elevators, offline } = useElevatorData();
  const { data: reservations } = usePolling(getLibraryReservations, [], 5000);
  const { data: rooms } = usePolling(getRooms, [], 5000);
  const { data: free } = usePolling(() => getClassrooms({ onlyFree: true }), [], 15000);
  const { data: groups } = usePolling(getElevatorGroups, [], 5000);

  const student = elevators.filter((e) => e.type === "student");
  const working = student.filter((e) => e.status === "Working").length;
  const broken = student.filter((e) => e.status !== "Working");
  const alerts = (groups || []).filter((g) => g.message);

  const active = reservations ? reservations.filter((r) => r.verified).length : null;
  const waiting = reservations ? reservations.length - active : 0;
  const freeRooms = rooms ? rooms.filter((r) => r.status === "free").length : null;

  return (
    <div>
      <h2 className="page-title">Smart Atlas</h2>
      <p className="hint">Your Campus, Made Smarter. Demo data, not connected to Atlas University systems.</p>

      {offline && <div className="alert">Server not reachable: some numbers show “–”.</div>}
      {alerts.map((g) => (
        <div className="alert" key={g.groupId}>⚠️ {g.message}</div>
      ))}

      <div className="dash-stats">
        <Stat
          title="Library"
          value={active === null ? "–" : active}
          sub={active === null ? "Library server offline" : `Active reservations${waiting ? ` · ${waiting} waiting for QR` : ""}`}
          tone="blue"
          onClick={() => go("library")}
        />
        <Stat
          title="Study rooms"
          value={freeRooms === null ? "–" : `${freeRooms}/${rooms.length}`}
          sub="Free rooms"
          tone="green"
          onClick={() => go("facilities")}
        />
        <Stat
          title="Elevators"
          value={student.length ? `${working}/${student.length}` : "–"}
          sub={broken.length ? `Not working: ${broken.map((e) => e.elevatorId).join(", ")}` : "Student elevators working"}
          tone={broken.length ? "amber" : "green"}
          onClick={() => go("facilities")}
        />
        <Stat
          title="Classrooms"
          value={free ? free.count : "–"}
          sub="Free right now"
          tone="violet"
          onClick={() => go("facilities")}
        />
      </div>

      <button className="dash-nav-card" onClick={() => go("navigation")}>
        <span>
          <strong>Smart Navigation</strong>
          <span className="hint">Fastest route across Blocks A, B and C, avoiding elevators that are out of service or busy.</span>
        </span>
        <span className="dash-arrow" aria-hidden="true">→</span>
      </button>
    </div>
  );
}
