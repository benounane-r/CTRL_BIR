export const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const ELEVATOR_STATUS = {
  Working: { label: 'Operational', cls: 'ok' },
  'Out of Service': { label: 'Out of Service', cls: 'bad' },
  'Under Maintenance': { label: 'Under Maintenance', cls: 'warn' }
};

export const CROWD_LABELS = { low: 'Low', medium: 'Medium', high: 'High', very_high: 'Very High' };
export const FAULT_STATUS = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved' };
export const LEVEL_CLS = { low: 'ok', medium: 'warn', high: 'bad' };

export const floorLabel = (f) => (f === 0 ? 'Ground Floor' : `${f}. Floor`);

const pad = (n) => String(n).padStart(2, '0');
export const timeString = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
// 1 = Monday ... 7 = Sunday
export const todayDay = () => ((new Date().getDay() + 6) % 7) + 1;

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
