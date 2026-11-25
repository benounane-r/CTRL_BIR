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
    if (!window.confirm('All demo data will be reset to its initial state. Are you sure?')) return;
    try {
      await resetDemo();
      setMessage({ type: 'ok', text: 'Demo data reset to initial state.' });
      setKey((k) => k + 1);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  return (
    <div key={key}>
      <h2 className="page-title">Admin</h2>
      <p className="hint">Your changes will reflect on the student screen within a few seconds.</p>
      {message && <div className={`message ${message.type}`}>{message.text}</div>}
      <AdminElevators />
      <AdminFaults />
      <AdminRooms />
      <AdminDensity />
      <button className="danger" onClick={handleReset}>
        Reset Demo Data
      </button>
    </div>
  );
}
