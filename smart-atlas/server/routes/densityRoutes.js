const express = require('express');
const Area = require('../models/Area');
const DensityReport = require('../models/DensityReport');
const Classroom = require('../models/Classroom');
const Lesson = require('../models/Lesson');
const wrap = require('../utils/wrap');
const { REPORT_WINDOW_MINUTES } = require('../config/constants');
const { LABELS, levelFromRate, aggregateReports, forecastBand } = require('../services/densityService');
const { toMinutes, toHHMM, dayOfWeek, minutesOfDay, todayKey } = require('../services/timeUtils');

const router = express.Router();

// Sensör sayaçları gün değişince sıfırlanır (kayma birikmesin diye)
async function resetCountersIfNewDay() {
  await Area.updateMany({ type: 'sensor', countDate: { $ne: todayKey() } }, { $set: { count: 0, countDate: todayKey() } });
}

// GET /api/density -> tüm bölgelerin durumu
router.get(
  '/density',
  wrap(async (req, res) => {
    await resetCountersIfNewDay();
    const now = new Date();
    const [areas, reports] = await Promise.all([
      Area.find().sort({ _id: 1 }).lean(),
      DensityReport.find({ createdAt: { $gte: new Date(now.getTime() - REPORT_WINDOW_MINUTES * 60 * 1000) } }).lean()
    ]);

    const result = areas.map((a) => {
      if (a.type === 'sensor') {
        const rate = a.capacity > 0 ? a.count / a.capacity : 0;
        const level = levelFromRate(rate);
        return {
          areaId: a.areaId, name: a.name, location: a.location, type: a.type, capacity: a.capacity,
          count: a.count, occupancyRate: Math.round(rate * 100), level, levelLabel: LABELS[level], source: 'sensor'
        };
      }
      const agg = aggregateReports(reports.filter((r) => r.areaId === a.areaId), now, REPORT_WINDOW_MINUTES);
      return {
        areaId: a.areaId, name: a.name, location: a.location, type: a.type, capacity: a.capacity,
        level: agg.level, levelLabel: agg.level ? LABELS[agg.level] : 'Bilgi yok',
        reportCount: agg.count, lastReportAt: agg.lastAt, source: agg.level ? 'reports' : 'none'
      };
    });
    res.json({ areas: result, reportWindowMinutes: REPORT_WINDOW_MINUTES });
  })
);

// POST /api/density/areas/:areaId/gate  { direction: 'in' | 'out', amount?: 1 }  (kapı sensörü simülasyonu)
router.post(
  '/density/areas/:areaId/gate',
  wrap(async (req, res) => {
    const { direction } = req.body || {};
    const amount = req.body && req.body.amount !== undefined ? Number(req.body.amount) : 1;
    if (!['in', 'out'].includes(direction)) return res.status(400).json({ error: "direction 'in' veya 'out' olmalı" });
    if (!Number.isInteger(amount) || amount < 1 || amount > 50) return res.status(400).json({ error: 'amount 1-50 arası olmalı' });

    await resetCountersIfNewDay();
    const area = await Area.findOne({ areaId: req.params.areaId });
    if (!area) return res.status(404).json({ error: 'Bölge bulunamadı' });
    if (area.type !== 'sensor') return res.status(400).json({ error: 'Bu bölgede sensör yok, öğrenci bildirimi kullanılır' });

    // Sayı hiç 0'ın altına inmez, kapasiteyi geçmez
    const next = direction === 'in' ? area.count + amount : area.count - amount;
    area.count = Math.max(0, Math.min(area.capacity, next));
    await area.save();
    res.json({ areaId: area.areaId, count: area.count, capacity: area.capacity });
  })
);

// POST /api/density/areas/:areaId/report  { level: 'low' | 'medium' | 'high' }  (öğrenci bildirimi)
router.post(
  '/density/areas/:areaId/report',
  wrap(async (req, res) => {
    const { level } = req.body || {};
    if (!['low', 'medium', 'high'].includes(level)) return res.status(400).json({ error: "level 'low', 'medium' veya 'high' olmalı" });
    const area = await Area.findOne({ areaId: req.params.areaId });
    if (!area) return res.status(404).json({ error: 'Bölge bulunamadı' });
    if (area.type !== 'report') return res.status(400).json({ error: 'Bu bölge sensörle takip ediliyor' });
    await DensityReport.create({ areaId: area.areaId, level });
    res.status(201).json({ ok: true });
  })
);

// GET /api/density/forecast?day=1&start=12:00&end=14:00
// Ders programına göre "kampüs yoğunluğu %x-%y arasında beklenir" tahmini + günün saatlik tahmini
router.get(
  '/density/forecast',
  wrap(async (req, res) => {
    const day = req.query.day ? Number(req.query.day) : dayOfWeek();
    if (!Number.isInteger(day) || day < 1 || day > 7) return res.status(400).json({ error: 'day 1-7 arası olmalı' });

    const [totalRooms, lessons] = await Promise.all([Classroom.countDocuments(), Lesson.find({ day }).lean()]);

    let range = null;
    if (req.query.start || req.query.end) {
      const s = toMinutes(req.query.start);
      const e = toMinutes(req.query.end);
      if (s === null || e === null || e <= s) return res.status(400).json({ error: 'start/end HH:MM olmalı ve end > start' });
      range = { start: toHHMM(s), end: toHHMM(e), ...forecastBand(lessons, totalRooms, s, e) };
    } else {
      const now = minutesOfDay();
      const s = Math.floor(now / 60) * 60;
      range = { start: toHHMM(s), end: toHHMM(s + 60), ...forecastBand(lessons, totalRooms, s, s + 60) };
    }

    const hourly = [];
    for (let h = 8; h <= 19; h += 1) {
      hourly.push({ hour: toHHMM(h * 60), ...forecastBand(lessons, totalRooms, h * 60, (h + 1) * 60) });
    }
    res.json({ day, basis: 'Ders programına göre tahmin (ölçüm değildir)', range, hourly });
  })
);

module.exports = router;
