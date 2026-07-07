import mongoose from 'mongoose';

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
    lastBilledReading: {
      type: Number,
      required: [true, 'Last billed reading value is required'],
      min: [0, 'Billed reading cannot be negative'],
    },
    lastBilledDate: {
      type: Date,
      required: [true, 'Last billed reading date is required'],
    },
    billingCycleDays: {
      type: Number,
      default: 30,
      min: [1, 'Billing cycle must be at least 1 day'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

meterSchema.index({ user: 1, name: 1 }, { unique: true });

export default mongoose.model('Meter', meterSchema);