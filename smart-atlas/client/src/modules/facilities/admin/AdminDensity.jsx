import { useState } from 'react';
import { getDensity, sendGate } from '../api.js';
import { usePolling } from '../hooks.js';

// Kapı sensörü simülasyonu: gerçek sensör aynı adrese (POST /api/density/areas/:id/gate) istek atar
export default function AdminDensity() {
  const { data, reload } = usePolling(getDensity, [], 5000);
  const [error, setError] = useState('');

  async function gate(areaId, direction, amount) {
    try {
      await sendGate(areaId, direction, amount);
      setError('');
      reload();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!data) return <div className="card">Yükleniyor...</div>;
  const sensors = data.areas.filter((a) => a.type === 'sensor');

  return (
    <section className="card">
      <h2>Kapı sensörü simülasyonu</h2>
      <p className="hint">Kafeler ve yemekhane için giren/çıkan sayısı. Sayı 0'ın altına inmez, kapasiteyi geçmez.</p>
      {error && <p className="error-text">{error}</p>}
      <ul className="list">
        {sensors.map((a) => (
          <li className="list-row" key={a.areaId}>
            <div>
              <strong>{a.name}</strong>
              <div className="hint">
                {a.count} / {a.capacity} kişi (%{a.occupancyRate})
              </div>
            </div>
            <div className="row-actions">
              <button onClick={() => gate(a.areaId, 'out', 5)}>−5</button>
              <button onClick={() => gate(a.areaId, 'out', 1)}>−1 çıkış</button>
              <button onClick={() => gate(a.areaId, 'in', 1)}>+1 giriş</button>
              <button onClick={() => gate(a.areaId, 'in', 5)}>+5</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
