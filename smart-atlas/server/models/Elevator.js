const mongoose = require('mongoose');

// Rania'nın README'sindeki durum isimleriyle aynı
const STATUSES = ['Working', 'Out of Service', 'Under Maintenance'];

const elevatorSchema = new mongoose.Schema({
  elevatorId: { type: String, required: true, unique: true }, // A-1, B-I-1, BC-U-1 ...
  groupId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['student', 'staff', 'emergency'], default: 'student' },
  blocks: [String],           // hizmet verdiği bloklar (üçlü asansör: B ve C)
  floorFrom: Number,          // çıktığı ilk kat
  floorTo: Number,            // çıktığı son kat
  note: String,
  order: { type: Number, default: 0 },
  status: { type: String, enum: STATUSES, default: 'Working' },
  statusUpdatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Elevator', elevatorSchema);
module.exports.STATUSES = STATUSES;
