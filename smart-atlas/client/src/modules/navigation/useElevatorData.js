import { getElevators } from "../facilities/api.js";
import { usePolling } from "../facilities/hooks.js";
import { ELEVATOR_SNAPSHOT } from "./elevatorSnapshot.js";

// Elevator list for navigation and dashboard.
// Normally Irem's GET /api/elevators (refreshed every 3 s). If the server was never reachable,
// falls back to the built-in snapshot and says so (offline = true).
export function useElevatorData() {
  const { data, error } = usePolling(getElevators, [], 3000);
  const offline = !data && !!error;
  const elevators = data || (offline ? ELEVATOR_SNAPSHOT : []);

  // { groupId: crowdLevel } for groups that track crowds
  const crowd = {};
  for (const e of elevators) if (e.crowdLevel) crowd[e.groupId] = e.crowdLevel;

  const outIds = elevators.filter((e) => e.status !== "Working").map((e) => e.elevatorId);
  return { elevators, crowd, outIds, offline, loading: !data && !error, stale: !!data && !!error };
}
