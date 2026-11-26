import { useState } from 'react';
import { createFault, getElevators, getFaultMeta } from './api.js';
import { usePolling } from './hooks.js';
import { floorLabel } from './format.js';

export default function FaultForm() {
  const { data: meta } = usePolling(getFaultMeta, []);
  const { data: elevators } = usePolling(getElevators, []);
  const [category, setCategory] = useState('Elevator');
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
        elevatorId: category === 'Elevator' ? elevatorId : ''
      });
      setResult({ type: 'ok', text: 'Report submitted, notified relevant units. Thank you!' });
      setDescription('');
      setRoom('');
    } catch (err) {
      setResult({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  if (!meta) return <div className="card">Loading...</div>;

  return (
    <section className="card">
      <h2>Report Issue</h2>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {meta.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            Block
            <select value={block} onChange={(e) => setBlock(e.target.value)}>
              {meta.blocks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label>
            Floor
            <select value={floor} onChange={(e) => setFloor(Number(e.target.value))}>
              {Array.from({ length: 15 }, (_, i) => i).map((f) => (
                <option key={f} value={f}>
                  {floorLabel(f)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Room / Class (optional)
            <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g., C5-03" />
          </label>
        </div>

        {category === 'Elevator' && elevators && (
          <label>
            Which elevator? (optional)
            <select value={elevatorId} onChange={(e) => setElevatorId(e.target.value)}>
              <option value="">I don't know</option>
              {elevators.map((el) => (
                <option key={el.elevatorId} value={el.elevatorId}>
                  {el.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          Explanation
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe the issue (minimum 5 characters)"
          />
        </label>

        <button className="primary" type="submit" disabled={busy || description.trim().length < 5}>
          {busy ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      {result && <div className={`message ${result.type}`}>{result.text}</div>}
      <p className="hint">Elevator fault report will not change the elevator's status until confirmed by staff.</p>
    </section>
  );
}
