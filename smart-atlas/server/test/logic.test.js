const test = require('node:test');
const assert = require('node:assert');
const { computeAvailability, mergeIntervals } = require('../services/classroomService');
const { aggregateReports, forecastBand, levelFromRate } = require('../services/densityService');
const { toMinutes, toHHMM, dayOfWeek } = require('../services/timeUtils');
const { buildSampleLessons } = require('../seed/seedData.pure');
const classrooms = require('../data/classrooms');

const rooms = [
  { code: 'C5-03', name: 'Da Vinci 14', block: 'C', floor: 5 },
  { code: 'B8-02', name: 'Farabi 01', block: 'B', floor: 8 }
];
const lessons = [
  { classroomCode: 'C5-03', day: 1, startMinutes: toMinutes('12:00'), endMinutes: toMinutes('14:45') },
  { classroomCode: 'C5-03', day: 1, startMinutes: toMinutes('15:00'), endMinutes: toMinutes('17:45') }
];

test('saat çevirileri', () => {
  assert.strictEqual(toMinutes('14:30'), 870);
  assert.strictEqual(toHHMM(885), '14:45');
  assert.strictEqual(toMinutes('25:00'), null);
  assert.strictEqual(toMinutes('abc'), null);
  assert.strictEqual(dayOfWeek(new Date(2026, 10, 23)), 1); // 23 Kasım 2026 Pazartesi
  assert.strictEqual(dayOfWeek(new Date(2026, 10, 22)), 7); // Pazar
});

test('sınıf, aralık içinde ders varsa dolu', () => {
  const r = computeAvailability({ classrooms: rooms, lessons, startMinutes: toMinutes('13:00'), endMinutes: toMinutes('14:00') });
  assert.strictEqual(r.find((x) => x.code === 'C5-03').status, 'occupied');
  assert.strictEqual(r.find((x) => x.code === 'B8-02').status, 'free');
});

test('aralığın tamamı boşsa boş, dersin bittiği dakikada boş', () => {
  const free = computeAvailability({ classrooms: rooms, lessons, startMinutes: toMinutes('14:45'), endMinutes: toMinutes('15:00') });
  assert.strictEqual(free.find((x) => x.code === 'C5-03').status, 'free');
  const touching = computeAvailability({ classrooms: rooms, lessons, startMinutes: toMinutes('14:00'), endMinutes: toMinutes('15:30') });
  assert.strictEqual(touching.find((x) => x.code === 'C5-03').status, 'occupied');
});

test('dolu saat aralıkları ders adı olmadan döner', () => {
  const r = computeAvailability({ classrooms: rooms, lessons, startMinutes: 0, endMinutes: 1 });
  const c = r.find((x) => x.code === 'C5-03');
  assert.deepStrictEqual(c.busy, [{ start: '12:00', end: '14:45' }, { start: '15:00', end: '17:45' }]);
  assert.ok(!('lessonName' in c) && !('course' in c));
});

test('onlyFree sadece boşları döndürür', () => {
  const r = computeAvailability({ classrooms: rooms, lessons, startMinutes: toMinutes('13:00'), endMinutes: toMinutes('14:00'), onlyFree: true });
  assert.deepStrictEqual(r.map((x) => x.code), ['B8-02']);
});

test('mergeIntervals üst üste binenleri birleştirir', () => {
  const m = mergeIntervals([{ startMinutes: 540, endMinutes: 600 }, { startMinutes: 580, endMinutes: 700 }]);
  assert.deepStrictEqual(m, [{ startMinutes: 540, endMinutes: 700 }]);
});

test('öğrenci bildirimleri son 30 dk ortalaması', () => {
  const now = new Date();
  const mins = (n) => new Date(now.getTime() - n * 60000);
  const agg = aggregateReports(
    [{ level: 'high', createdAt: mins(5) }, { level: 'high', createdAt: mins(10) }, { level: 'low', createdAt: mins(90) }],
    now, 30
  );
  assert.strictEqual(agg.level, 'high');
  assert.strictEqual(agg.count, 2);
  assert.strictEqual(aggregateReports([], now, 30).level, null);
});

test('sensör seviyeleri', () => {
  assert.strictEqual(levelFromRate(0.1), 'low');
  assert.strictEqual(levelFromRate(0.5), 'medium');
  assert.strictEqual(levelFromRate(0.9), 'high');
});

test('ders programına göre tahmin bandı', () => {
  const ls = [];
  for (let i = 0; i < 5; i += 1) ls.push({ startMinutes: 540, endMinutes: 600 }); // 5/10 sınıf derste
  const b = forecastBand(ls, 10, 540, 600);
  assert.deepStrictEqual(b, { lowPercent: 40, highPercent: 60, averageUsage: 50 });
  assert.deepStrictEqual(forecastBand([], 0, 540, 600), { lowPercent: 0, highPercent: 0, averageUsage: 0 });
});

test('örnek program: çakışma yok, saatler 09:00-19:45 içinde, gerçekçi doluluk', () => {
  const s = buildSampleLessons(classrooms);
  const seen = new Map();
  for (const l of s) {
    assert.ok(l.startMinutes >= 540 && l.endMinutes <= 19 * 60 + 45);
    const key = `${l.classroomCode}-${l.day}`;
    const prev = seen.get(key) || [];
    assert.ok(prev.every((p) => l.startMinutes >= p.endMinutes || l.endMinutes <= p.startMinutes), 'çakışma var: ' + key);
    prev.push(l);
    seen.set(key, prev);
  }
  const t = 11 * 60;
  const busyNow = s.filter((l) => l.day === 2 && l.startMinutes <= t && t < l.endMinutes).length;
  const ratio = busyNow / classrooms.length;
  assert.ok(ratio > 0.2 && ratio < 0.9, `doluluk oranı beklenmedik: ${ratio}`);
});
