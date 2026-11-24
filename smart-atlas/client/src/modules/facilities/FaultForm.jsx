import { useState } from 'react';
import { createFault, getElevators, getFaultMeta } from './api.js';
import { usePolling } from './hooks.js';
import { floorLabel } from './format.js';

export default function FaultForm() {
  const { data: meta } = usePolling(getFaultMeta, []);
  const { data: elevators } = usePolling(getElevators, []);
  const [category, setCategory] = useState('Asansör');
  const [block, setBlock] = useState('A');
  const [floor, setFloor] = useState(0);
  const [room, setRoom] = useState('');
  const [elevatorId, setElevatorId] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      await createFault({
        category,
        block,
        floor,
        room,
        description,
        elevatorId: category === 'Asansör' ? elevatorId : ''
      });
      setResult({ type: 'ok', text: 'Bildirimin alındı, ilgili birimlere iletildi. Teşekkürler!' });
      setDescription('');
      setRoom('');
    } catch (err) {
      setResult({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  if (!meta) return <div className="card">Yükleniyor...</div>;

  return (
    <section className="card">
      <h2>Arıza Bildir</h2>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>
            Kategori
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {meta.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            Blok
            <select value={block} onChange={(e) => setBlock(e.target.value)}>
              {meta.blocks.map((b) => (
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
            Oda / sınıf (isteğe bağlı)
            <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="örn. C5-03" />
          </label>
        </div>

        {category === 'Asansör' && elevators && (
          <label>
            Hangi asansör? (isteğe bağlı)
            <select value={elevatorId} onChange={(e) => setElevatorId(e.target.value)}>
              <option value="">Bilmiyorum</option>
              {elevators.map((el) => (
                <option key={el.elevatorId} value={el.elevatorId}>
                  {el.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          Açıklama
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Sorunu kısaca anlat (en az 5 karakter)"
          />
        </label>

        <button className="primary" type="submit" disabled={busy || description.trim().length < 5}>
          {busy ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </form>
      {result && <div className={`message ${result.type}`}>{result.text}</div>}
      <p className="hint">Asansör arızası bildirimi, çalışan onaylayana kadar asansörün durumunu değiştirmez.</p>
    </section>
  );
}
