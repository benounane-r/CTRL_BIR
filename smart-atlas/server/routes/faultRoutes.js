const express = require('express');
const mongoose = require('mongoose');
const Fault = require('../models/Fault');
const Elevator = require('../models/Elevator');
const wrap = require('../utils/wrap');

const router = express.Router();

// GET /api/faults/meta -> form seçenekleri (frontend'in listeleri sabit yazmaması için)
router.get('/faults/meta', (req, res) => {
  res.json({ categories: Fault.CATEGORIES, blocks: Fault.BLOCKS, statuses: Fault.STATUSES });
});

// POST /api/faults  (öğrenci arıza bildirir)
router.post(
  '/faults',
  wrap(async (req, res) => {
    const { category, block, floor, room, description, elevatorId } = req.body || {};
    if (!Fault.CATEGORIES.includes(category)) return res.status(400).json({ error: 'Geçersiz kategori' });
    if (!Fault.BLOCKS.includes(block)) return res.status(400).json({ error: 'Geçersiz blok' });
    const text = description ? String(description).trim() : '';
    if (text.length < 5) return res.status(400).json({ error: 'Açıklama en az 5 karakter olmalı' });
    if (text.length > 500) return res.status(400).json({ error: 'Açıklama en fazla 500 karakter olabilir' });
    const floorNum = floor === undefined || floor === '' ? 0 : Number(floor);
    if (!Number.isInteger(floorNum) || floorNum < 0 || floorNum > 30) {
      return res.status(400).json({ error: 'Kat 0 (zemin) ile 30 arasında olmalı' });
    }

    let elevator = null;
    if (category === 'Asansör' && elevatorId) {
      elevator = await Elevator.findOne({ elevatorId });
      if (!elevator) return res.status(404).json({ error: 'Asansör bulunamadı' });
    }

    const fault = await Fault.create({
      category,
      block,
      floor: floorNum,
      room: room ? String(room).trim().slice(0, 40) : '',
      description: text,
      elevatorId: elevator ? elevator.elevatorId : null
    });
    res.status(201).json(fault);
  })
);

// GET /api/faults?status=open&category=Asansör  (çalışan paneli)
router.get(
  '/faults',
  wrap(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = String(req.query.status);
    if (req.query.category) filter.category = String(req.query.category);
    const faults = await Fault.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    res.json(faults);
  })
);

// PATCH /api/faults/:id  { status, elevatorStatus? }
// Çalışan arızayı güncellerken (kararımız: çalışan onaylayınca) asansör durumunu da değiştirebilir.
router.patch(
  '/faults/:id',
  wrap(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Geçersiz arıza id' });
    const { status, elevatorStatus } = req.body || {};
    if (status !== undefined && !Fault.STATUSES.includes(status)) {
      return res.status(400).json({ error: `status şunlardan biri olmalı: ${Fault.STATUSES.join(', ')}` });
    }
    if (elevatorStatus !== undefined && !Elevator.STATUSES.includes(elevatorStatus)) {
      return res.status(400).json({ error: `elevatorStatus şunlardan biri olmalı: ${Elevator.STATUSES.join(', ')}` });
    }

    const fault = await Fault.findById(req.params.id);
    if (!fault) return res.status(404).json({ error: 'Arıza bulunamadı' });

    if (status !== undefined) fault.status = status;
    await fault.save();

    let elevator = null;
    if (elevatorStatus !== undefined) {
      if (!fault.elevatorId) return res.status(400).json({ error: 'Bu arıza bir asansöre bağlı değil' });
      elevator = await Elevator.findOneAndUpdate(
        { elevatorId: fault.elevatorId },
        { status: elevatorStatus, statusUpdatedAt: new Date() },
        { new: true }
      ).lean();
    }
    res.json({ fault, elevator });
  })
);

module.exports = router;
