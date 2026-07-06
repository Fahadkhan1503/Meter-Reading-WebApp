const mongoose = require('mongoose');

const meterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Meter name is required'],
      trim: true,
      maxlength: [50, 'Meter name cannot exceed 50 characters'],
    },
    meterNumber: {
      type: String,
      trim: true,
    },
    target: {
      type: Number,
      default: 0,
      min: [0, 'Target cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

meterSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Meter', meterSchema);