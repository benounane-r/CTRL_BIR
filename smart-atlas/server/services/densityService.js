const LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'Crowded'
};
const SCORE = { low: 1, medium: 2, high: 3 };

// Sensörlü alan: doluluk oranına göre seviye
function levelFromRate(rate) {
  if (rate < 0.4) return 'low';
  if (rate < 0.75) return 'medium';
  return 'high';
}

// Öğrenci bildirimleri: son N dakikadaki bildirimlerin ortalaması
function aggregateReports(reports, now, windowMinutes) {
  const cutoff = now.getTime() - windowMinutes * 60 * 1000;
  const recent = reports.filter((r) => new Date(r.createdAt).getTime() >= cutoff);
  if (recent.length === 0) return { level: null, count: 0, lastAt: null };
  const avg = recent.reduce((sum, r) => sum + SCORE[r.level], 0) / recent.length;
  const level = avg < 1.67 ? 'low' : avg < 2.34 ? 'medium' : 'high';
  const lastAt = new Date(Math.max(...recent.map((r) => new Date(r.createdAt).getTime())));
  return { level, count: recent.length, lastAt };
}

// Ders programına göre tahmin: aralıkta derste olan sınıf oranından %x-%y bandı üretir.
// Bu bir ÖLÇÜM değil TAHMİN. Her 15 dakikada bir örnek alınır, ortalamanın ±10 puanı band olur.
function forecastBand(lessons, totalRooms, startMinutes, endMinutes) {
  if (totalRooms <= 0 || endMinutes <= startMinutes) {
    return { lowPercent: 0, highPercent: 0, averageUsage: 0 };
  }
  let sum = 0;
  let samples = 0;
  for (let t = startMinutes; t < endMinutes; t += 15) {
    const busy = lessons.filter((l) => l.startMinutes <= t && t < l.endMinutes).length;
    sum += busy / totalRooms;
    samples += 1;
  }
  const avg = Math.round((sum / samples) * 100);
  return {
    lowPercent: Math.max(0, avg - 10),
    highPercent: Math.min(100, avg + 10),
    averageUsage: avg
  };
}

module.exports = { LABELS, levelFromRate, aggregateReports, forecastBand };
