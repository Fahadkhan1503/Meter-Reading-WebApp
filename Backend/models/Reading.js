const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema(
  {
    meter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meter',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    value: {
      type: Number,
      required: [true, 'Meter reading value is required'],
      min: [0, 'Reading value cannot be negative'],
    },
    unitsUsed: {
      type: Number,
      default: 0,
      min: [0, 'Units used cannot be negative'],
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    source: {
      type: String,
      enum: ['manual', 'photo'],
      default: 'manual',
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot exceed 200 characters'],
    },
  },
  { timestamps: true }
);

readingSchema.index({ meter: 1, date: -1 });

module.exports = mongoose.model('Reading', readingSchema);