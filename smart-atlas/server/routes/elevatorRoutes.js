const express = require('express');
const Elevator = require('../models/Elevator');
const ElevatorGroup = require('../models/ElevatorGroup');
const wrap = require('../utils/wrap');

const router = express.Router();
const CROWD_LABELS = { low: 'Düşük', medium: 'Orta', high: 'Yüksek', very_high: 'Çok yüksek' };

// Yoğunsa gösterilecek uyarı (rota hesabını Navigation tarafı yapar, burada sadece bilgi)
function crowdMessage(group, groupsById) {
  if (!group.trackCrowd) return null;
  if (group.crowdLevel !== 'high' && group.crowdLevel !== 'very_high') return null;
  const level = group.crowdLevel === 'very_high' ? 'çok yoğun' : 'yoğun';
  const alts = (group.alternatives || []).map((id) => groupsById.get(id)).filter(Boolean);
  if (alts.length === 0) return `${group.name} şu an ${level}.`;
  return `${group.name} şu an ${level}. Mümkünse ${alts.map((a) => a.name).join(' veya ')} tercih edin.`;
}

// GET /api/elevators -> asansör listesi (durum + grubunun yoğunluk seviyesi)
router.get(
  '/elevators',
  wrap(async (req, res) => {
    const [elevators, groups] = await Promise.all([
      Elevator.find().sort({ order: 1 }).lean(),
      ElevatorGroup.find().lean()
    ]);
    const byId = new Map(groups.map((g) => [g.groupId, g]));
    res.json(
      elevators.map((e) => {
        const g = byId.get(e.groupId);
        return {
          ...e,
          crowdLevel: g && g.trackCrowd ? g.crowdLevel : null,
          crowdMessage: g ? crowdMessage(g, byId) : null
        };
      })
    );
  })
);

// GET /api/elevator-groups -> gruplar ve yoğunluk uyarıları
router.get(
  '/elevator-groups',
  wrap(async (req, res) => {
    const groups = await ElevatorGroup.find().lean();
    const byId = new Map(groups.map((g) => [g.groupId, g]));
    res.json(
      groups.map((g) => ({
        ...g,
        crowdLabel: g.trackCrowd ? CROWD_LABELS[g.crowdLevel] : null,
        message: crowdMessage(g, byId)
      }))
    );
  })
);

// PATCH /api/elevators/:id  { status }  (Working | Out of Service | Under Maintenance)
router.patch(
  '/elevators/:id',
  wrap(async (req, res) => {
    const { status } = req.body || {};
    if (!Elevator.STATUSES.includes(status)) {
      return res.status(400).json({ error: `status şunlardan biri olmalı: ${Elevator.STATUSES.join(', ')}` });
    }
    const updated = await Elevator.findOneAndUpdate(
      { elevatorId: req.params.id },
      { status, statusUpdatedAt: new Date() },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ error: 'Asansör bulunamadı' });
    res.json(updated);
  })
);

// PATCH /api/elevator-groups/:groupId  { crowdLevel }  (kamera simülasyonu)
router.patch(
  '/elevator-groups/:groupId',
  wrap(async (req, res) => {
    const { crowdLevel } = req.body || {};
    if (!ElevatorGroup.CROWD_LEVELS.includes(crowdLevel)) {
      return res.status(400).json({ error: `crowdLevel şunlardan biri olmalı: ${ElevatorGroup.CROWD_LEVELS.join(', ')}` });
    }
    const group = await ElevatorGroup.findOne({ groupId: req.params.groupId });
    if (!group) return res.status(404).json({ error: 'Grup bulunamadı' });
    if (!group.trackCrowd) return res.status(400).json({ error: 'Bu grupta yoğunluk takibi yok' });
    group.crowdLevel = crowdLevel;
    group.crowdUpdatedAt = new Date();
    await group.save();
    res.json(group);
  })
);

module.exports = router;
