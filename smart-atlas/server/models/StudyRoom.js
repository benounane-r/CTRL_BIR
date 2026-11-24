const mongoose = require('mongoose');

const studyRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  block: { type: String, required: true },
  floor: { type: Number, required: true, min: 0 },
  capacity: { type: Number, default: 4, min: 1 },
  status: { type: String, enum: ['free', 'occupied'], default: 'free' },
  statusSource: { type: String, enum: ['seed', 'student', 'admin', 'auto'], default: 'seed' },
  occupiedSince: { type: Date },
  statusUpdatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudyRoom', studyRoomSchema);
