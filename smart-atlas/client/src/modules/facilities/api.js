// Sunucu ile konuşan tek yer. Tüm istekler /api ile başlar (vite.config.js sunucuya yönlendirir).
const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // boş cevap
  }
  if (!res.ok) {
    throw new Error((data && data.error) || `İstek başarısız (${res.status})`);
  }
  return data;
}

const json = (method, body) => ({ method, body: JSON.stringify(body || {}) });

// Boş değerleri atıp sorgu metni üretir
function query(params) {
  const clean = {};
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') clean[k] = String(v);
  });
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : '';
}

// Asansörler
export const getElevators = () => request('/elevators');
export const getElevatorGroups = () => request('/elevator-groups');
export const setElevatorStatus = (id, status) => request(`/elevators/${id}`, json('PATCH', { status }));
export const setGroupCrowd = (groupId, crowdLevel) => request(`/elevator-groups/${groupId}`, json('PATCH', { crowdLevel }));

// Sınıflar
export const getClassrooms = (params) => request(`/classrooms${query(params)}`);

// Arızalar
export const getFaultMeta = () => request('/faults/meta');
export const createFault = (body) => request('/faults', json('POST', body));
export const getFaults = (params) => request(`/faults${query(params)}`);
export const updateFault = (id, body) => request(`/faults/${id}`, json('PATCH', body));

// Çalışma odaları ve bildirimler
export const getRooms = () => request('/rooms');
export const createRoom = (body) => request('/rooms', json('POST', body));
export const setRoomStatus = (id, status, source) => request(`/rooms/${id}`, json('PATCH', { status, source }));
export const getNotifications = () => request('/notifications');

// Kampüs yoğunluğu
export const getDensity = () => request('/density');
export const sendGate = (areaId, direction, amount = 1) =>
  request(`/density/areas/${areaId}/gate`, json('POST', { direction, amount }));
export const sendDensityReport = (areaId, level) => request(`/density/areas/${areaId}/report`, json('POST', { level }));
export const getForecast = (params) => request(`/density/forecast${query(params)}`);

// Demo
export const resetDemo = () => request('/demo/reset', json('POST'));
