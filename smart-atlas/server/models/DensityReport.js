const mongoose = require('mongoose');

const densityReportSchema = new mongoose.Schema(
  {
    areaId: { type: String, required: true, index: true },
    level: { type: String, enum: ['low', 'medium', 'high'], required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DensityReport', densityReportSchema);
