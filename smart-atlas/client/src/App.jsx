import { useEffect, useState } from 'react';
import DashboardPage from './modules/dashboard/DashboardPage.jsx';
import NavigationPage from './modules/navigation/NavigationPage.jsx';
import LibraryPage from './modules/library/LibraryPage.jsx';
import FacilitiesPage from './modules/facilities/FacilitiesPage.jsx';
import FacilitiesAdminPage from './modules/facilities/admin/FacilitiesAdminPage.jsx';
import NotificationBell from './modules/facilities/NotificationBell.jsx';

// Shared app shell (Rania). Each module is one page; to add a page, add a line to PAGES and one to the switch below.
// Pages are kept in the URL hash (#navigation), so refreshing the browser keeps you on the same page.
const PAGES = [
  { id: 'home', label: 'Dashboard' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'library', label: 'Library' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'admin', label: 'Admin' }
];

const pageFromHash = () => {
  const id = window.location.hash.replace('#', '');
  return PAGES.some((p) => p.id === id) ? id : 'home';
};

export default function App() {
  const [page, setPage] = useState(pageFromHash);

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = (id) => {
    window.location.hash = id;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          Smart <span>Atlas</span>
        </h1>
        <nav>
          {PAGES.map((p) => (
            <button key={p.id} className={page === p.id ? 'nav active' : 'nav'} onClick={() => go(p.id)}>
              {p.label}
            </button>
          ))}
        </nav>
        <NotificationBell />
      </header>
      <main>
        {page === 'home' && <DashboardPage go={go} />}
        {page === 'navigation' && <NavigationPage />}
        {page === 'library' && <LibraryPage />}
        {page === 'facilities' && <FacilitiesPage />}
        {page === 'admin' && <FacilitiesAdminPage />}
      </main>
      <footer className="app-footer">Demo data only. Not connected to Atlas University systems.</footer>
    </div>
  );
}
