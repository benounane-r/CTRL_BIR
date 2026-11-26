import { useState } from 'react';
import { getElevators, getElevatorGroups, setElevatorStatus, setGroupCrowd } from '../api.js';
import { usePolling } from '../hooks.js';
import { ELEVATOR_STATUS, CROWD_LABELS } from '../format.js';

export default function AdminElevators() {
  const { data: elevators, reload } = usePolling(getElevators, [], 5000);
  const { data: groups, reload: reloadGroups } = usePolling(getElevatorGroups, [], 5000);
  const [error, setError] = useState('');

  async function changeStatus(id, status) {
    try {
      await setElevatorStatus(id, status);
      setError('');
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  async function changeCrowd(groupId, level) {
    try {
      await setGroupCrowd(groupId, level);
      setError('');
      reloadGroups();
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!elevators || !groups) return <div className="card">Loading...</div>;

  return (
    <section className="card">
      <h2>Elevator Statuses</h2>
      {error && <p className="error-text">{error}</p>}
      <ul className="list">
        {elevators.map((e) => (
          <li className="list-row" key={e.elevatorId}>
            <strong>{e.name}</strong>
            <select value={e.status} onChange={(ev) => changeStatus(e.elevatorId, ev.target.value)}>
              {Object.entries(ELEVATOR_STATUS).map(([value, s]) => (
                <option key={value} value={value}>
                  {s.label} ({value})
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>

      <h3>Occupancy (Camera Simulation)</h3>
      <p className="hint">In a real system, data from the cameras in front of the elevators would be manually adjusted here.</p>
      <ul className="list">
        {groups
          .filter((g) => g.trackCrowd)
          .map((g) => (
            <li className="list-row" key={g.groupId}>
              <strong>{g.name}</strong>
              <select value={g.crowdLevel} onChange={(ev) => changeCrowd(g.groupId, ev.target.value)}>
                {Object.entries(CROWD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </li>
          ))}
      </ul>
    </section>
  );
}
