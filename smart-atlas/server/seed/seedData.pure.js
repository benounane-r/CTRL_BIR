// Örnek ders programı üretimi (veritabanına bağımlı değil, test edilebilir)

// Aynı sayıları üreten basit rastgele sayı üreteci (seed her çalışınca aynı program çıksın)
function mulberry32(a) {
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Her sınıf için hafta içi örnek program: saat başı başlar, 45 dk'lık dersler (1-3 saatlik bloklar)
function buildSampleLessons(classrooms) {
  const lessons = [];
  for (const c of classrooms) {
    for (let day = 1; day <= 5; day += 1) {
      const rnd = mulberry32(hash(`${c.code}-${day}`));
      let h = 9;
      while (h <= 18) {
        if (rnd() < 0.4) {
          const r = rnd();
          const len = r < 0.35 ? 1 : r < 0.8 ? 2 : 3;
          const lastHour = Math.min(h + len - 1, 19);
          lessons.push({
            classroomCode: c.code, day, startMinutes: h * 60, endMinutes: lastHour * 60 + 45, source: 'sample'
          });
          h = lastHour + 1;
        } else {
          h += 1;
        }
      }
    }
  }
  return lessons;
}

module.exports = { buildSampleLessons };
