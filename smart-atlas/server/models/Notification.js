const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['new_study_room'], default: 'new_study_room' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    block: String,
    floor: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
