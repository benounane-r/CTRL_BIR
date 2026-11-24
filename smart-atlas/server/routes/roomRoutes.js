const express = require('express');
const StudyRoom = require('../models/StudyRoom');
const Notification = require('../models/Notification');
const wrap = require('../utils/wrap');
const { ROOM_AUTO_FREE_HOURS } = require('../config/constants');

const router = express.Router();
const BLOCKS = ['A', 'B', 'C'];

// Uzun süre "dolu" kalan odaları otomatik boşalt (bilgi eskimesin diye)
async function freeStaleRooms() {
  if (!ROOM_AUTO_FREE_HOURS) return;
  const cutoff = new Date(Date.now() - ROOM_AUTO_FREE_HOURS * 60 * 60 * 1000);
  await StudyRoom.updateMany(
    { status: 'occupied', occupiedSince: { $lte: cutoff } },
    { $set: { status: 'free', statusSource: 'auto', statusUpdatedAt: new Date() }, $unset: { occupiedSince: '' } }
  );
}

const floorText = (floor) => (floor === 0 ? 'zemin kata' : `${floor}. kata`);

// GET /api/rooms -> çalışma odaları (dolu/boş)
router.get(
  '/rooms',
  wrap(async (req, res) => {
    await freeStaleRooms();
    const rooms = await StudyRoom.find().sort({ block: 1, floor: 1, name: 1 }).lean();
    res.json(rooms);
  })
);

// POST /api/rooms  { name, block, floor, capacity }  (çalışan yeni oda ekler -> öğrencilere bildirim)
router.post(
  '/rooms',
  wrap(async (req, res) => {
    const { name, block, floor, capacity } = req.body || {};
    const roomName = name ? String(name).trim() : '';
    if (!roomName) return res.status(400).json({ error: 'Oda adı zorunlu' });
    if (!BLOCKS.includes(block)) return res.status(400).json({ error: 'Blok A, B veya C olmalı' });
    const floorNum = Number(floor);
    if (!Number.isInteger(floorNum) || floorNum < 0 || floorNum > 30) {
      return res.status(400).json({ error: 'Kat 0 (zemin) ile 30 arasında olmalı' });
    }
    const cap = capacity === undefined || capacity === '' ? 4 : Number(capacity);
    if (!Number.isInteger(cap) || cap < 1 || cap > 50) return res.status(400).json({ error: 'Kapasite 1-50 arası olmalı' });

    const room = await StudyRoom.create({
      roomId: `SR-${Date.now().toString(36)}`,
      name: roomName,
      block,
      floor: floorNum,
      capacity: cap,
      statusSource: 'admin'
    });

    await Notification.create({
      title: 'Yeni çalışma odası',
      message: `${block} blok ${floorText(floorNum)} yeni çalışma odası eklenmiştir.`,
      block,
      floor: floorNum
    });
    res.status(201).json(room);
  })
);

// PATCH /api/rooms/:id  { status: 'free' | 'occupied', source?: 'student' | 'admin' }
// Öğrenci bildirir, çalışan düzeltir.
router.patch(
  '/rooms/:id',
  wrap(async (req, res) => {
    const { status, source } = req.body || {};
    if (!['free', 'occupied'].includes(status)) {
      return res.status(400).json({ error: "status 'free' veya 'occupied' olmalı" });
    }
    const update = {
      status,
      statusSource: source === 'admin' ? 'admin' : 'student',
      statusUpdatedAt: new Date()
    };
    const room = await StudyRoom.findOne({ roomId: req.params.id });
    if (!room) return res.status(404).json({ error: 'Oda bulunamadı' });
    Object.assign(room, update);
    if (status === 'occupied') room.occupiedSince = new Date();
    else room.occupiedSince = undefined;
    await room.save();
    res.json(room);
  })
);

// GET /api/notifications?since=ISO  -> son bildirimler (öğrenci ekranı 10 sn'de bir sorar)
router.get(
  '/notifications',
  wrap(async (req, res) => {
    const filter = {};
    if (req.query.since) {
      const since = new Date(req.query.since);
      if (Number.isNaN(since.getTime())) return res.status(400).json({ error: 'since geçerli bir tarih olmalı' });
      filter.createdAt = { $gt: since };
    }
    const list = await Notification.find(filter).sort({ createdAt: -1 }).limit(20).lean();
    res.json(list);
  })
);

module.exports = router;
