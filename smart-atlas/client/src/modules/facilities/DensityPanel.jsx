import { useState } from 'react';
import { getDensity, getForecast, sendDensityReport } from './api.js';
import { usePolling } from './hooks.js';
import { DAY_NAMES, LEVEL_CLS, timeString, todayDay, formatDateTime } from './format.js';

const toMin = (s) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

function Forecast() {
  const now = new Date();
  const [day, setDay] = useState(todayDay());
  const [start, setStart] = useState(timeString(now));
  const [end, setEnd] = useState(timeString(new Date(now.getTime() + 2 * 3600000)));
  const invalid = !start || !end || toMin(end) <= toMin(start);

  const { data, error } = usePolling(() => (invalid ? null : getForecast({ day, start, end })), [day, start, end]);

  return (
    <section className="card">
      <h2>Density Forecast</h2>
      <p className="hint">Based on the class schedule, not actual measurements.</p>
      <div className="form-grid">
        <label>
          Day
          <select value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {DAY_NAMES.map((n, i) => (
              <option key={n} value={i + 1}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Start Time
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label>
          End Time
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>
      {invalid && <p className="error-text">End time must be after start time.</p>}
      {error && <p className="error-text">{error}</p>}
      {data && !invalid && (
        <>
          <div className="forecast">
            {DAY_NAMES[day - 1]} between {data.range.start}-{data.range.end} the campus density is expected to be between{' '}
            <strong>
              %{data.range.lowPercent}-%{data.range.highPercent}
            </strong>{' '}
            
          </div>
          <div className="hourly">
            {data.hourly.map((h) => (
              <div className="hourly-row" key={h.hour}>
                <span>{h.hour}</span>
                <div className="bar">
                  <div className="bar-fill" style={{ width: `${h.averageUsage}%` }} />
                </div>
                <span>%{h.averageUsage}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default function DensityPanel() {
  const { data, error, reload } = usePolling(getDensity, [], 5000);
  const [message, setMessage] = useState(null);

  async function report(areaId, level) {
    try {
      await sendDensityReport(areaId, level);
      setMessage({ type: 'ok', text: 'Thank you for your report!' });
      reload();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  if (error) return <div className="card error-text">Failed to fetch density information: {error}</div>;
  if (!data) return <div className="card">Loading...</div>;

  const sensors = data.areas.filter((a) => a.type === 'sensor');
  const reports = data.areas.filter((a) => a.type === 'report');

  return (
    <div>
      <section className="card">
        <h2>Cafeterias and Dining Halls</h2>
        <p className="hint">Based on door counters (simulated in the demo).</p>
        <div className="grid">
          {sensors.map((a) => (
            <div className="area" key={a.areaId}>
              <div className="card-head">
                <strong>{a.name}</strong>
                <span className={`chip ${LEVEL_CLS[a.level]}`}>{a.levelLabel}</span>
              </div>
              <div className="hint">{a.location}</div>
              <div className="bar">
                <div className={`bar-fill ${LEVEL_CLS[a.level]}`} style={{ width: `${a.occupancyRate}%` }} />
              </div>
              <div className="hint">
                {a.count} / {a.capacity} people (%{a.occupancyRate})
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Common Areas</h2>
        <p className="hint">Based on student reports (last {data.reportWindowMinutes} minutes).</p>
        {message && <div className={`message ${message.type}`}>{message.text}</div>}
        <div className="grid">
          {reports.map((a) => (
            <div className="area" key={a.areaId}>
              <div className="card-head">
                <strong>{a.name}</strong>
                <span className={`chip ${a.level ? LEVEL_CLS[a.level] : ''}`}>{a.levelLabel}</span>
              </div>
              <div className="hint">
                {a.location}
                {a.reportCount > 0 ? ` · ${a.reportCount} reports, last: ${formatDateTime(a.lastReportAt)}` : ''}
              </div>
              <div className="row-actions">
                <button onClick={() => report(a.areaId, 'low')}>Empty</button>
                <button onClick={() => report(a.areaId, 'medium')}>Moderate</button>
                <button onClick={() => report(a.areaId, 'high')}>Crowded</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Forecast />
    </div>
  );
}
