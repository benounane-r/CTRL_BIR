const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // C5-03
  name: { type: String, required: true },               // Da Vinci 14
  block: { type: String, required: true },
  floor: { type: Number, required: true },
  number: String
});

module.exports = mongoose.model('Classroom', classroomSchema);
