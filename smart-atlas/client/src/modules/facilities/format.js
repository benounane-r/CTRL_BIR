export const DAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export const ELEVATOR_STATUS = {
  Working: { label: 'Çalışıyor', cls: 'ok' },
  'Out of Service': { label: 'Arızalı', cls: 'bad' },
  'Under Maintenance': { label: 'Bakımda', cls: 'warn' }
};

export const CROWD_LABELS = { low: 'Düşük', medium: 'Orta', high: 'Yüksek', very_high: 'Çok yüksek' };
export const FAULT_STATUS = { open: 'Açık', in_progress: 'İşlemde', resolved: 'Çözüldü' };
export const LEVEL_CLS = { low: 'ok', medium: 'warn', high: 'bad' };

export const floorLabel = (f) => (f === 0 ? 'Zemin kat' : `${f}. kat`);

const pad = (n) => String(n).padStart(2, '0');
export const timeString = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
// 1 = Pazartesi ... 7 = Pazar
export const todayDay = () => ((new Date().getDay() + 6) % 7) + 1;

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
