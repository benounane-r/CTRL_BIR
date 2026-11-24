const mongoose = require('mongoose');

// Kampüs yoğunluk bölgesi.
//  type "sensor": kapı sensörü (giren/çıkan sayısı, demoda simüle)
//  type "report": öğrenci bildirimi (boş/orta/kalabalık)
const areaSchema = new mongoose.Schema({
  areaId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: String,
  type: { type: String, enum: ['sensor', 'report'], required: true },
  capacity: { type: Number, default: 100 },
  count: { type: Number, default: 0 },   // sadece sensor alanlarında
  countDate: String                      // sayacın ait olduğu gün (gün değişince sıfırlanır)
});

module.exports = mongoose.model('Area', areaSchema);
