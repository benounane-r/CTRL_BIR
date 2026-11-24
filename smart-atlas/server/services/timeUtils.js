// "14:30" -> 870 (gün başından itibaren dakika). Geçersizse null.
function toMinutes(str) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(str || '').trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

// 870 -> "14:30"
function toHHMM(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// 1 = Pazartesi ... 7 = Pazar
function dayOfWeek(date = new Date()) {
  return ((date.getDay() + 6) % 7) + 1;
}

function minutesOfDay(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

// "2026-11-24" (yerel saate göre)
function todayKey(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

module.exports = { toMinutes, toHHMM, dayOfWeek, minutesOfDay, todayKey };
