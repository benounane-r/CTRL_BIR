import { getElevators } from "../facilities/api.js";
import { usePolling } from "../facilities/hooks.js";
import { ELEVATOR_SNAPSHOT } from "./elevatorSnapshot.js";

// Elevator list for navigation and dashboard.
// Normally Irem's GET /api/elevators (refreshed every 3 s). The built-in snapshot is used instead when
//   - the server cannot be reached         -> offline = true
//   - the server answers but the database has no elevators yet (demo data never loaded) -> empty = true
// so the route never silently loses its elevators.
export function useElevatorData() {
  const { data, error } = usePolling(getElevators, [], 3000);
  const offline = !data && !!error;
  const empty = !!data && data.length === 0;
  const elevators = data && !empty ? data : offline || empty ? ELEVATOR_SNAPSHOT : [];

  // { groupId: crowdLevel } for groups that track crowds
  const crowd = {};
  for (const e of elevators) if (e.crowdLevel) crowd[e.groupId] = e.crowdLevel;

  const outIds = elevators.filter((e) => e.status !== "Working").map((e) => e.elevatorId);
  return { elevators, crowd, outIds, offline, empty, loading: !data && !error, stale: !!data && !!error };
}
