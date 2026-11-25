import { useState } from 'react';
import { getElevators, getFaults, updateFault } from '../api.js';
import { usePolling } from '../hooks.js';
import { ELEVATOR_STATUS, FAULT_STATUS, floorLabel, formatDateTime } from '../format.js';

function FaultRow({ fault, elevator, onSaved }) {
  const [status, setStatus] = useState(fault.status);
  const [elevatorStatus, setElevatorStatus] = useState(''); // '' = asansör durumunu değiştirme
  const [message, setMessage] = useState(null);

  async function save() {
    try {
      const body = { status };
      if (elevatorStatus) body.elevatorStatus = elevatorStatus;
      await updateFault(fault._id, body);
      setMessage({ type: 'ok', text: 'Saved.' });
      setElevatorStatus('');
      onSaved();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  return (
    <li className="fault">
      <div className="card-head">
        <strong>{fault.category}</strong>
        <span className={`chip ${fault.status === 'resolved' ? 'ok' : fault.status === 'in_progress' ? 'warn' : 'bad'}`}>
          {FAULT_STATUS[fault.status]}
        </span>
      </div>
      <div className="hint">
        {fault.block} block · {floorLabel(fault.floor)}
        {fault.room ? ` · ${fault.room}` : ''} · {formatDateTime(fault.createdAt)}
      </div>
      <p>{fault.description}</p>

      <div className="form-grid">
        <label>
          Fault Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(FAULT_STATUS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {fault.elevatorId && (
          <label>
            {elevator ? elevator.name : fault.elevatorId} situation (approval)
            <select value={elevatorStatus} onChange={(e) => setElevatorStatus(e.target.value)}>
              <option value="">Change{elevator ? ` (current: ${ELEVATOR_STATUS[elevator.status]?.label})` : ''}</option>
              {Object.entries(ELEVATOR_STATUS).map(([value, s]) => (
                <option key={value} value={value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <button onClick={save}>Save</button>
      {message && <span className={`inline-msg ${message.type}`}> {message.text}</span>}
    </li>
  );
}

export default function AdminFaults() {
  const [filter, setFilter] = useState('');
  const { data: faults, error, reload } = usePolling(() => getFaults({ status: filter }), [filter], 5000);
  const { data: elevators, reload: reloadElevators } = usePolling(getElevators, [], 5000);

  return (
    <section className="card">
      <div className="card-head">
        <h2>Fault Reports</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          {Object.entries(FAULT_STATUS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="error-text">{error}</p>}
      {!faults && <p>Loading...</p>}
      <ul className="faults">
        {faults &&
          faults.map((f) => (
            <FaultRow
              key={`${f._id}-${f.updatedAt}`}
              fault={f}
              elevator={elevators ? elevators.find((e) => e.elevatorId === f.elevatorId) : null}
              onSaved={() => {
                reload();
                reloadElevators();
              }}
            />
          ))}
        {faults && faults.length === 0 && <li className="hint">No faults found with this filter.</li>}
      </ul>
    </section>
  );
}
