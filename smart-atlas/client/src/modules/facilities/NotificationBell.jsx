import { useEffect, useRef, useState } from 'react';
import { getNotifications } from './api.js';
import { formatDateTime } from './format.js';
import './facilities.css';

const KEY = 'facilities.lastSeen';

function loadLastSeen() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
function saveLastSeen(iso) {
  try {
    localStorage.setItem(KEY, iso);
  } catch {
    // saklanamazsa sorun değil
  }
}

// Uygulama içi bildirim zili: yeni çalışma odası eklenince öğrenciye uyarı çıkar.
export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [lastSeen, setLastSeen] = useState(() => {
    const stored = loadLastSeen();
    if (stored) return stored;
    const now = new Date().toISOString(); // ilk açılışta eski bildirimler "okunmamış" sayılmasın
    saveLastSeen(now);
    return now;
  });
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const knownIds = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const list = await getNotifications();
        if (cancelled) return;
        setItems(list);
        if (knownIds.current === null) {
          knownIds.current = new Set(list.map((n) => n._id)); // ilk yükleme: toast gösterme
        } else {
          const fresh = list.filter((n) => !knownIds.current.has(n._id));
          fresh.forEach((n) => knownIds.current.add(n._id));
          if (fresh.length > 0) {
            setToast(fresh[0]);
            setTimeout(() => setToast(null), 7000);
          }
        }
      } catch {
        // geçici hata, sonraki turda tekrar dener
      }
    }
    load();
    const timer = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const unread = items.filter((n) => new Date(n.createdAt) > new Date(lastSeen)).length;

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      const now = new Date().toISOString();
      saveLastSeen(now);
      setLastSeen(now);
    }
  }

  return (
    <div className="bell-wrap">
      <button className="bell" onClick={toggle} aria-label="Bildirimler">
        🔔{unread > 0 && <span className="bell-badge">{unread}</span>}
      </button>

      {open && (
        <div className="bell-menu">
          <strong>Bildirimler</strong>
          {items.length === 0 && <p className="hint">Henüz bildirim yok.</p>}
          {items.map((n) => (
            <div className="bell-item" key={n._id}>
              <div>{n.message}</div>
              <div className="hint">{formatDateTime(n.createdAt)}</div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="toast" onClick={() => setToast(null)}>
          🔔 {toast.message}
        </div>
      )}
    </div>
  );
}
