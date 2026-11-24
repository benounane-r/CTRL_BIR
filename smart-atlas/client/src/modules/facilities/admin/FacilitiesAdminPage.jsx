import { useState } from 'react';
import AdminElevators from './AdminElevators.jsx';
import AdminFaults from './AdminFaults.jsx';
import AdminRooms from './AdminRooms.jsx';
import AdminDensity from './AdminDensity.jsx';
import { resetDemo } from '../api.js';
import '../facilities.css';

// Çalışanların kullandığı Admin sayfası (giriş yok, demo)
export default function FacilitiesAdminPage() {
  const [message, setMessage] = useState(null);
  const [key, setKey] = useState(0); // sıfırlayınca bölümleri yeniden yükle

  async function handleReset() {
    if (!window.confirm('Tüm demo verisi başlangıç haline dönecek. Emin misin?')) return;
    try {
      await resetDemo();
      setMessage({ type: 'ok', text: 'Demo verisi sıfırlandı.' });
      setKey((k) => k + 1);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  return (
    <div key={key}>
      <h2 className="page-title">Admin</h2>
      <p className="hint">Yaptığın değişiklikler öğrenci ekranına birkaç saniye içinde yansır.</p>
      {message && <div className={`message ${message.type}`}>{message.text}</div>}
      <AdminElevators />
      <AdminFaults />
      <AdminRooms />
      <AdminDensity />
      <button className="danger" onClick={handleReset}>
        Demo verisini sıfırla
      </button>
    </div>
  );
}
