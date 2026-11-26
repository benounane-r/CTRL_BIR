
const mongoose = require('mongoose');

const CATEGORIES = [
  'Elevator',
  'Classroom Equipment',
  'Air Conditioning/Heating',
  'Electrical/Lighting',
  'Water/Restrooms',
  'Other'
];

const BLOCKS = ['A', 'B', 'C', 'Other'];
const STATUSES = ['open', 'in_progress', 'resolved'];

const faultSchema = new mongoose.Schema(
  {
    category: { type: String, enum: CATEGORIES, required: true },
    block: { type: String, enum: BLOCKS, required: true },
    floor: { type: Number, min: 0, max: 30, default: 0 },
    room: { type: String, default: '' },
    description: { type: String, required: true, minlength: 5, maxlength: 500 },
    elevatorId: { type: String, default: null },
    status: { type: String, enum: STATUSES, default: 'open' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fault', faultSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.BLOCKS = BLOCKS;
module.exports.STATUSES = STATUSES;
