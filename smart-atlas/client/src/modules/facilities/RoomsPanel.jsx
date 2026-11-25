import { useState } from 'react';
import { getRooms, setRoomStatus } from './api.js';
import { usePolling } from './hooks.js';
import { floorLabel } from './format.js';

export default function RoomsPanel() {
  const { data: rooms, error, reload } = usePolling(getRooms, [], 5000);
  const [message, setMessage] = useState(null);

  async function report(room, status) {
    try {
      await setRoomStatus(room.roomId, status, 'student');
      setMessage({ type: 'ok', text: status === 'occupied' ? 'Thank you for reporting the room as occupied.' : 'Thank you for reporting the room as free.' });
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  if (error) return <div className="card error-text">Rooms could not be loaded: {error}</div>;
  if (!rooms) return <div className="card">Loading...</div>;

  return (
    <section className="card">
      <h2>Study Rooms</h2>
      <p className="hint">Report the room as occupied when you start using it, and as free when you leave. This is just an example.</p>
      {message && <div className={`message ${message.type}`}>{message.text}</div>}
      <ul className="list">
        {rooms.map((r) => (
          <li className="list-row" key={r.roomId}>
            <div>
              <strong>{r.name}</strong>
              <div className="hint">
                {r.block} block · {floorLabel(r.floor)} · {r.capacity} people
              </div>
            </div>
            <div className="row-actions">
              <span className={`chip ${r.status === 'free' ? 'ok' : 'bad'}`}>{r.status === 'free' ? 'Free' : 'Occupied'}</span>
              {r.status === 'free' ? (
                <button onClick={() => report(r, 'occupied')}>Report Occupied</button>
              ) : (
                <button onClick={() => report(r, 'free')}>Report Free</button>
              )}
            </div>
          </li>
        ))}
        {rooms.length === 0 && <li className="hint">No study rooms available.</li>}
      </ul>
    </section>
  );
}
