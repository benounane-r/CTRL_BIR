const mongoose = require('mongoose');

const CATEGORIES = ['Asansör', 'Sınıf ekipmanı', 'Klima/ısıtma', 'Elektrik/aydınlatma', 'Su/tuvalet', 'Diğer'];
const BLOCKS = ['A', 'B', 'C', 'Diğer'];
const STATUSES = ['open', 'in_progress', 'resolved']; // Açık, İşlemde, Çözüldü

const faultSchema = new mongoose.Schema(
  {
    category: { type: String, enum: CATEGORIES, required: true },
    block: { type: String, enum: BLOCKS, required: true },
    floor: { type: Number, min: 0, max: 30, default: 0 }, // 0 = zemin kat
    room: { type: String, default: '' },
    description: { type: String, required: true, minlength: 5, maxlength: 500 },
    elevatorId: { type: String, default: null }, // kategori Asansör ise hangi asansör
    status: { type: String, enum: STATUSES, default: 'open' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fault', faultSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.BLOCKS = BLOCKS;
module.exports.STATUSES = STATUSES;
