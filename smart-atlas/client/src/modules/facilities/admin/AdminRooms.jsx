import { useState } from 'react';
import { createRoom, getRooms, setRoomStatus } from '../api.js';
import { usePolling } from '../hooks.js';
import { floorLabel } from '../format.js';

export default function AdminRooms() {
  const { data: rooms, reload } = usePolling(getRooms, [], 5000);
  const [name, setName] = useState('');
  const [block, setBlock] = useState('B');
  const [floor, setFloor] = useState(3);
  const [capacity, setCapacity] = useState(4);
  const [message, setMessage] = useState(null);

  async function add(e) {
    e.preventDefault();
    try {
      await createRoom({ name, block, floor, capacity });
      setMessage({ type: 'ok', text: 'Oda eklendi, öğrencilere bildirim gönderildi.' });
      setName('');
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  async function setStatus(room, status) {
    try {
      await setRoomStatus(room.roomId, status, 'admin');
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  return (
    <section className="card">
      <h2>Çalışma odaları</h2>
      <form onSubmit={add}>
        <div className="form-grid">
          <label>
            Oda adı
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="örn. Çalışma Odası 6" />
          </label>
          <label>
            Blok
            <select value={block} onChange={(e) => setBlock(e.target.value)}>
              {['A', 'B', 'C'].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label>
            Kat
            <select value={floor} onChange={(e) => setFloor(Number(e.target.value))}>
              {Array.from({ length: 15 }, (_, i) => i).map((f) => (
                <option key={f} value={f}>
                  {floorLabel(f)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Kapasite
            <input type="number" min="1" max="50" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
          </label>
        </div>
        <button className="primary" type="submit" disabled={!name.trim()}>
          Oda ekle ve öğrencilere bildir
        </button>
      </form>
      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <ul className="list">
        {(rooms || []).map((r) => (
          <li className="list-row" key={r.roomId}>
            <div>
              <strong>{r.name}</strong>
              <div className="hint">
                {r.block} blok · {floorLabel(r.floor)} · {r.capacity} kişilik
              </div>
            </div>
            <div className="row-actions">
              <span className={`chip ${r.status === 'free' ? 'ok' : 'bad'}`}>{r.status === 'free' ? 'Boş' : 'Dolu'}</span>
              <button onClick={() => setStatus(r, r.status === 'free' ? 'occupied' : 'free')}>
                {r.status === 'free' ? 'Dolu yap' : 'Boş yap'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
