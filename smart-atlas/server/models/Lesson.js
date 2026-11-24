const mongoose = require('mongoose');

// Bir sınıftaki ders aralığı. Ders adı / hoca bilgisi BİLEREK yok.
const lessonSchema = new mongoose.Schema({
  classroomCode: { type: String, required: true, index: true },
  day: { type: Number, required: true, min: 1, max: 7 }, // 1 = Pazartesi
  startMinutes: { type: Number, required: true },        // 12:00 -> 720
  endMinutes: { type: Number, required: true },          // 14:45 -> 885
  source: { type: String, enum: ['real', 'sample'], default: 'sample' }
});

lessonSchema.index({ day: 1, classroomCode: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
