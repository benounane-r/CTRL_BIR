const express = require('express');
const Classroom = require('../models/Classroom');
const Lesson = require('../models/Lesson');
const wrap = require('../utils/wrap');
const { computeAvailability } = require('../services/classroomService');
const { toMinutes, dayOfWeek, minutesOfDay } = require('../services/timeUtils');

const router = express.Router();

// GET /api/classrooms
//   ?day=1..7        (varsayılan: bugün, 1 = Pazartesi)
//   &start=14:00&end=16:00   aralığın TAMAMINDA boş olanlar (verilmezse "şu an")
//   &at=11:30        "şu an" yerine bu saati kullan (demo/test için)
//   &onlyFree=true   sadece boş olanlar
//   &block=C&floor=5 filtreler
router.get(
  '/classrooms',
  wrap(async (req, res) => {
    const day = req.query.day ? Number(req.query.day) : dayOfWeek();
    if (!Number.isInteger(day) || day < 1 || day > 7) {
      return res.status(400).json({ error: 'day 1 (Pazartesi) ile 7 (Pazar) arasında olmalı' });
    }

    let startMinutes;
    let endMinutes;
    let mode = 'now';
    if (req.query.start || req.query.end) {
      startMinutes = toMinutes(req.query.start);
      endMinutes = toMinutes(req.query.end);
      if (startMinutes === null || endMinutes === null) {
        return res.status(400).json({ error: 'start ve end HH:MM biçiminde olmalı (örn. 14:00)' });
      }
      if (endMinutes <= startMinutes) {
        return res.status(400).json({ error: 'Bitiş saati başlangıçtan sonra olmalı' });
      }
      mode = 'range';
    } else {
      const at = req.query.at ? toMinutes(req.query.at) : minutesOfDay();
      if (at === null) return res.status(400).json({ error: 'at HH:MM biçiminde olmalı' });
      startMinutes = at;
      endMinutes = at + 1;
    }

    const filter = {};
    if (req.query.block) filter.block = String(req.query.block).toUpperCase();
    if (req.query.floor !== undefined && req.query.floor !== '') {
      const floor = Number(req.query.floor);
      if (!Number.isInteger(floor)) return res.status(400).json({ error: 'floor sayı olmalı' });
      filter.floor = floor;
    }

    const classrooms = await Classroom.find(filter).sort({ code: 1 }).lean();
    const lessons = await Lesson.find({
      day,
      classroomCode: { $in: classrooms.map((c) => c.code) }
    }).lean();

    const rows = computeAvailability({
      classrooms,
      lessons,
      startMinutes,
      endMinutes,
      onlyFree: req.query.onlyFree === 'true'
    });
    res.json({ day, mode, startMinutes, endMinutes, count: rows.length, classrooms: rows });
  })
);

module.exports = router;
