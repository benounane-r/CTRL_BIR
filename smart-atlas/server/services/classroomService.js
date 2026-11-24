const { toHHMM } = require('./timeUtils');

// [aStart, aEnd) ile [bStart, bEnd) çakışıyor mu?
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

// Ders aralıklarını sıralar, üst üste binenleri birleştirir
function mergeIntervals(lessons) {
  const sorted = [...lessons].sort((a, b) => a.startMinutes - b.startMinutes);
  const out = [];
  for (const l of sorted) {
    const last = out[out.length - 1];
    if (last && l.startMinutes <= last.endMinutes) {
      last.endMinutes = Math.max(last.endMinutes, l.endMinutes);
    } else {
      out.push({ startMinutes: l.startMinutes, endMinutes: l.endMinutes });
    }
  }
  return out;
}

// Sınıfların [startMinutes, endMinutes) aralığındaki durumu.
// "free" = aralığın TAMAMINDA hiçbir ders yok. Ders adı hiçbir yerde tutulmaz/gösterilmez.
function computeAvailability({ classrooms, lessons, startMinutes, endMinutes, onlyFree = false }) {
  const byRoom = new Map();
  for (const l of lessons) {
    if (!byRoom.has(l.classroomCode)) byRoom.set(l.classroomCode, []);
    byRoom.get(l.classroomCode).push(l);
  }

  const rows = classrooms.map((c) => {
    const busy = mergeIntervals(byRoom.get(c.code) || []);
    const occupied = busy.some((b) => overlaps(b.startMinutes, b.endMinutes, startMinutes, endMinutes));
    return {
      code: c.code,
      name: c.name,
      block: c.block,
      floor: c.floor,
      status: occupied ? 'occupied' : 'free',
      busy: busy.map((b) => ({ start: toHHMM(b.startMinutes), end: toHHMM(b.endMinutes) }))
    };
  });

  return onlyFree ? rows.filter((r) => r.status === 'free') : rows;
}

module.exports = { overlaps, mergeIntervals, computeAvailability };
