import { getElevators, getElevatorGroups } from './api.js';
import { usePolling } from './hooks.js';
import { ELEVATOR_STATUS, CROWD_LABELS } from './format.js';

const TYPE_BADGE = { staff: 'Personel asansörü (hoca ofisleri)', emergency: 'Acil durum asansörü' };

export default function ElevatorsPanel() {
  const { data: elevators, error } = usePolling(getElevators, [], 5000);
  const { data: groups } = usePolling(getElevatorGroups, [], 5000);

  if (error) return <div className="card error-text">Asansör bilgisi alınamadı: {error}</div>;
  if (!elevators || !groups) return <div className="card">Yükleniyor...</div>;

  const alerts = groups.filter((g) => g.message);

  return (
    <div>
      {alerts.map((g) => (
        <div className="alert" key={g.groupId}>
          ⚠️ {g.message}
        </div>
      ))}

      {groups.map((g) => {
        const items = elevators.filter((e) => e.groupId === g.groupId);
        if (items.length === 0) return null;
        return (
          <section className="card" key={g.groupId}>
            <div className="card-head">
              <h2>{g.name}</h2>
              {g.trackCrowd && (
                <span className={`chip ${g.crowdLevel === 'low' ? 'ok' : g.crowdLevel === 'medium' ? 'warn' : 'bad'}`}>
                  Yoğunluk: {CROWD_LABELS[g.crowdLevel]}
                </span>
              )}
            </div>
            <ul className="list">
              {items.map((e) => {
                const st = ELEVATOR_STATUS[e.status] || { label: e.status, cls: '' };
                return (
                  <li className="list-row" key={e.elevatorId}>
                    <div>
                      <strong>{e.name}</strong>
                      <div className="hint">
                        {e.floorFrom ? `${e.floorFrom}-${e.floorTo}. katlar` : 'Kat bilgisi yok'}
                        {TYPE_BADGE[e.type] ? ` · ${TYPE_BADGE[e.type]}` : ''}
                        {e.blocks && e.blocks.length > 1 ? ` · ${e.blocks.join(' ve ')} blok` : ''}
                      </div>
                      {e.note && <div className="hint">{e.note}</div>}
                    </div>
                    <span className={`chip ${st.cls}`}>{st.label}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <p className="hint">Asansör sorunu mu var? "Arıza Bildir" sekmesinden haber verebilirsin.</p>
    </div>
  );
}
