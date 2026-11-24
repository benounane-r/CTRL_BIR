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
      setMessage({ type: 'ok', text: status === 'occupied' ? 'Teşekkürler, oda dolu olarak işaretlendi.' : 'Teşekkürler, oda boş olarak işaretlendi.' });
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  if (error) return <div className="card error-text">Odalar alınamadı: {error}</div>;
  if (!rooms) return <div className="card">Yükleniyor...</div>;

  return (
    <section className="card">
      <h2>Çalışma Odaları</h2>
      <p className="hint">Odayı kullanmaya başlarken "Dolu bildir", çıkarken "Boşalttım" de. Bilgi örnek veridir.</p>
      {message && <div className={`message ${message.type}`}>{message.text}</div>}
      <ul className="list">
        {rooms.map((r) => (
          <li className="list-row" key={r.roomId}>
            <div>
              <strong>{r.name}</strong>
              <div className="hint">
                {r.block} blok · {floorLabel(r.floor)} · {r.capacity} kişilik
              </div>
            </div>
            <div className="row-actions">
              <span className={`chip ${r.status === 'free' ? 'ok' : 'bad'}`}>{r.status === 'free' ? 'Boş' : 'Dolu'}</span>
              {r.status === 'free' ? (
                <button onClick={() => report(r, 'occupied')}>Dolu bildir</button>
              ) : (
                <button onClick={() => report(r, 'free')}>Boşalttım</button>
              )}
            </div>
          </li>
        ))}
        {rooms.length === 0 && <li className="hint">Henüz çalışma odası eklenmemiş.</li>}
      </ul>
    </section>
  );
}
