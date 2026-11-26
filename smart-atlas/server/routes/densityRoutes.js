
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

// Sensor counters are reset when a new day begins (to prevent accumulated drift)
async function resetCountersIfNewDay() {
  await Area.updateMany({ type: 'sensor', countDate: { $ne: todayKey() } }, { $set: { count: 0, countDate: todayKey() } });
}

// GET /api/density -> status of all areas
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
        level: agg.level, levelLabel: agg.level ? LABELS[agg.level] : 'No data',
        reportCount: agg.count, lastReportAt: agg.lastAt, source: agg.level ? 'reports' : 'none'
      };
    });
    res.json({ areas: result, reportWindowMinutes: REPORT_WINDOW_MINUTES });
  })
);

// POST /api/density/areas/:areaId/gate  { direction: 'in' | 'out', amount?: 1 }  (gate sensor simulation)
router.post(
  '/density/areas/:areaId/gate',
  wrap(async (req, res) => {
    const { direction } = req.body || {};
    const amount = req.body && req.body.amount !== undefined ? Number(req.body.amount) : 1;
    if (!['in', 'out'].includes(direction)) return res.status(400).json({ error: "direction must be 'in' or 'out'" });
    if (!Number.isInteger(amount) || amount < 1 || amount > 50) return res.status(400).json({ error: 'amount must be between 1 and 50' });

    await resetCountersIfNewDay();
    const area = await Area.findOne({ areaId: req.params.areaId });
    if (!area) return res.status(404).json({ error: 'Area not found' });
    if (area.type !== 'sensor') return res.status(400).json({ error: 'This area has no sensor; student reports are used instead' });

    // The count can never go below 0 or exceed the capacity
    const next = direction === 'in' ? area.count + amount : area.count - amount;
    area.count = Math.max(0, Math.min(area.capacity, next));
    await area.save();
    res.json({ areaId: area.areaId, count: area.count, capacity: area.capacity });
  })
);

// POST /api/density/areas/:areaId/report  { level: 'low' | 'medium' | 'high' }  (student report)
router.post(
  '/density/areas/:areaId/report',
  wrap(async (req, res) => {
    const { level } = req.body || {};
    if (!['low', 'medium', 'high'].includes(level)) return res.status(400).json({ error: "level must be 'low', 'medium', or 'high'" });
    const area = await Area.findOne({ areaId: req.params.areaId });
    if (!area) return res.status(404).json({ error: 'Area not found' });
    if (area.type !== 'report') return res.status(400).json({ error: 'This area is monitored by a sensor' });
    await DensityReport.create({ areaId: area.areaId, level });
    res.status(201).json({ ok: true });
  })
);

// GET /api/density/forecast?day=1&start=12:00&end=14:00
// Course schedule-based prediction: "campus occupancy is expected to be between X% and Y%" + hourly forecast
router.get(
  '/density/forecast',
  wrap(async (req, res) => {
    const day = req.query.day ? Number(req.query.day) : dayOfWeek();
    if (!Number.isInteger(day) || day < 1 || day > 7) return res.status(400).json({ error: 'day must be between 1 and 7' });

    const [totalRooms, lessons] = await Promise.all([Classroom.countDocuments(), Lesson.find({ day }).lean()]);

    let range = null;
    if (req.query.start || req.query.end) {
      const s = toMinutes(req.query.start);
      const e = toMinutes(req.query.end);
      if (s === null || e === null || e <= s) return res.status(400).json({ error: 'start/end must be in HH:MM format and end must be greater than start' });
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
    res.json({ day, basis: 'Course schedule-based prediction (not a measurement)', range, hourly });
  })
);

module.exports = router;
