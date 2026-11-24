const mongoose = require('mongoose');

const CROWD_LEVELS = ['low', 'medium', 'high', 'very_high'];

// Asansör grubu + kamera (simülasyon) ile belirlenen yoğunluk seviyesi
const elevatorGroupSchema = new mongoose.Schema({
  groupId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  blocks: [String],
  trackCrowd: { type: Boolean, default: false },
  alternatives: [String], // yoğunsa önerilecek gruplar
  crowdLevel: { type: String, enum: CROWD_LEVELS, default: 'low' },
  crowdUpdatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ElevatorGroup', elevatorGroupSchema);
module.exports.CROWD_LEVELS = CROWD_LEVELS;
