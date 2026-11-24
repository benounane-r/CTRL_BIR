import { useState } from 'react';
import ElevatorsPanel from './ElevatorsPanel.jsx';
import ClassroomsPanel from './ClassroomsPanel.jsx';
import RoomsPanel from './RoomsPanel.jsx';
import DensityPanel from './DensityPanel.jsx';
import FaultForm from './FaultForm.jsx';
import './facilities.css';

const TABS = [
  { id: 'elevators', label: 'Asansörler' },
  { id: 'classrooms', label: 'Sınıflar' },
  { id: 'rooms', label: 'Çalışma Odaları' },
  { id: 'density', label: 'Kampüs Yoğunluğu' },
  { id: 'fault', label: 'Arıza Bildir' }
];

// Öğrencinin gördüğü Campus Facilities sayfası
export default function FacilitiesPage() {
  const [tab, setTab] = useState('elevators');

  return (
    <div>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={t.id === tab ? 'tab active' : 'tab'} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'elevators' && <ElevatorsPanel />}
      {tab === 'classrooms' && <ClassroomsPanel />}
      {tab === 'rooms' && <RoomsPanel />}
      {tab === 'density' && <DensityPanel />}
      {tab === 'fault' && <FaultForm />}
    </div>
  );
}
