import { useState } from 'react';
import { getClassrooms } from './api.js';
import { usePolling } from './hooks.js';
import { DAY_NAMES, timeString, todayDay } from './format.js';

const toMin = (s) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

export default function ClassroomsPanel() {
  const now = new Date();
  const [mode, setMode] = useState('range'); // 'now' | 'range'
  const [day, setDay] = useState(todayDay());
  const [start, setStart] = useState(timeString(now));
  const [end, setEnd] = useState(timeString(new Date(now.getTime() + 2 * 3600000)));
  const [block, setBlock] = useState('');
  const [floor, setFloor] = useState('');
  const [onlyFree, setOnlyFree] = useState(true);

  const rangeInvalid = mode === 'range' && (!start || !end || toMin(end) <= toMin(start));

  const { data, error } = usePolling(
    async () => {
      if (rangeInvalid) return null;
      const params = { day, block, floor, onlyFree: onlyFree ? 'true' : '' };
      if (mode === 'range') {
        params.start = start;
        params.end = end;
      }
      return getClassrooms(params);
    },
    [mode, day, start, end, block, floor, onlyFree],
    30000
  );

  return (
    <section className="card">
      <h2>Boş Sınıflar</h2>
      <p className="hint">Örnek ders programına göre gösterilir. Sadece derslikler listelenir.</p>

      <div className="tabs small">
        <button className={mode === 'range' ? 'tab active' : 'tab'} onClick={() => setMode('range')}>
          Saat aralığı seç
        </button>
        <button className={mode === 'now' ? 'tab active' : 'tab'} onClick={() => setMode('now')}>
          Şu an
        </button>
      </div>

      <div className="form-grid">
        <label>
          Gün
          <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {DAY_NAMES.map((n, i) => (
              <option key={n} value={i + 1}>
                {n}
              </option>
            ))}
          </select>
        </label>
        {mode === 'range' && (
          <>
            <label>
              Başlangıç
              <input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label>
              Bitiş
              <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
            </label>
          </>
        )}
        <label>
          Blok
          <select value={block} onChange={(e) => setBlock(e.target.value)}>
            <option value="">Hepsi</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </label>
        <label>
          Kat
          <select value={floor} onChange={(e) => setFloor(e.target.value)}>
            <option value="">Hepsi</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((f) => (
              <option key={f} value={f}>
                {f}. kat
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="check">
        <input type="checkbox" checked={onlyFree} onChange={(e) => setOnlyFree(e.target.checked)} />
        Sadece boş olanları göster
      </label>

      {rangeInvalid && <p className="error-text">Bitiş saati başlangıçtan sonra olmalı.</p>}
      {error && <p className="error-text">Sınıflar alınamadı: {error}</p>}

      {data && (
        <>
          <p className="hint">
            {mode === 'range'
              ? `${DAY_NAMES[day - 1]} ${start}-${end} aralığının tamamında`
              : `${DAY_NAMES[day - 1]}, şu an`}{' '}
            · {data.count} sınıf
          </p>
          <ul className="list">
            {data.classrooms.map((c) => (
              <li className="list-row" key={c.code}>
                <div>
                  <strong>{c.code}</strong> <span className="hint">{c.name}</span>
                  <div className="hint">
                    {c.block} blok · {c.floor}. kat
                  </div>
                  <div className="hint">
                    {c.busy.length > 0
                      ? `Dolu saatler: ${c.busy.map((b) => `${b.start}-${b.end}`).join(', ')}`
                      : 'Bu gün ders yok'}
                  </div>
                </div>
                <span className={`chip ${c.status === 'free' ? 'ok' : 'bad'}`}>{c.status === 'free' ? 'Boş' : 'Dolu'}</span>
              </li>
            ))}
            {data.classrooms.length === 0 && <li className="hint">Bu koşullarda boş sınıf bulunamadı.</li>}
          </ul>
        </>
      )}
    </section>
  );
}
