import { useState } from 'react';
import FacilitiesPage from './modules/facilities/FacilitiesPage.jsx';
import FacilitiesAdminPage from './modules/facilities/admin/FacilitiesAdminPage.jsx';
import NotificationBell from './modules/facilities/NotificationBell.jsx';

// Bu dosya sadece Facilities modülünü tek başına çalıştırmak için basit bir kabuktur.
// Rania'nın uygulamasında:
//   - FacilitiesPage         -> "Facilities" sayfası
//   - FacilitiesAdminPage    -> "Admin" sayfasına eklenecek bölümler
//   - NotificationBell       -> üst menüye konabilir
export default function App() {
  const [page, setPage] = useState('facilities');

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          Smart <span>Atlas</span>
        </h1>
        <nav>
          <button className={page === 'facilities' ? 'nav active' : 'nav'} onClick={() => setPage('facilities')}>
            Facilities
          </button>
          <button className={page === 'admin' ? 'nav active' : 'nav'} onClick={() => setPage('admin')}>
            Admin
          </button>
        </nav>
        <NotificationBell />
      </header>
      <main>{page === 'facilities' ? <FacilitiesPage /> : <FacilitiesAdminPage />}</main>
      <footer className="app-footer">Demo verisi. Okulun sistemlerine bağlı değildir.</footer>
    </div>
  );
}
