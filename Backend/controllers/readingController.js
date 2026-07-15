import Reading from '../models/Reading.js';
import Meter from '../models/Meter.js';
import extractMeterReading from '../utils/extractReading.js';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// export const createReading = async (req, res) => {
//   try {
//     const { meterId, value, date, note, source } = req.body;

//     if (!meterId || value === undefined) {
//       return res.status(400).json({ message: 'meterId and value are required' });
//     }

//     const meter = await Meter.findOne({ _id: meterId, user: req.user.id });
//     if (!meter) {
//       return res.status(404).json({ message: 'Meter not found' });
//     }

//     const lastReading = await Reading.findOne({ meter: meterId }).sort({ date: -1 });

//     if (lastReading && value < lastReading.value) {
//       return res.status(400).json({
//         message: `New reading (${value}) cannot be lower than the last reading (${lastReading.value})`,
//       });
//     }

//     const unitsUsed = lastReading ? value - lastReading.value : value - meter.lastBilledReading;

//     const reading = await Reading.create({
//       meter: meterId,
//       user: req.user.id,
//       value,
//       unitsUsed,
//       date: date || Date.now(),
//       note,
//       source: source === 'photo' ? 'photo' : 'manual',
//     });

//     res.status(201).json(reading);
//   } catch (error) {
//     res.status(500).json({ message: 'Could not save reading', error: error.message });
//   }
// };
export const createReading = async (req, res) => {
  try {
    const { meterId, value, date, note, source } = req.body;

    if (!meterId || value === undefined) {
      return res.status(400).json({ message: 'meterId and value are required' });
    }

    const meter = await Meter.findOne({ _id: meterId, user: req.user.id });
    if (!meter) {
      return res.status(404).json({ message: 'Meter not found' });
    }

    const readingDate = date ? new Date(date) : new Date();

    // 👇 Check previous reading (before the new date)
    const previousReading = await Reading.findOne({
      meter: meterId,
      date: { $lt: readingDate },
    }).sort({ date: -1 });

    if (previousReading && value < previousReading.value) {
      return res.status(400).json({
        message: `New reading (${value}) cannot be lower than the reading on ${previousReading.date.toLocaleDateString()} (${previousReading.value})`,
      });
    }

    // 👇 Check next reading (after the new date)
    const nextReading = await Reading.findOne({
      meter: meterId,
      date: { $gt: readingDate },
    }).sort({ date: 1 });

    if (nextReading && value > nextReading.value) {
      return res.status(400).json({
        message: `New reading (${value}) cannot be higher than the reading on ${nextReading.date.toLocaleDateString()} (${nextReading.value})`,
      });
    }

    // Calculate units used
    const lastReading = previousReading || { value: meter.lastBilledReading };
    const unitsUsed = value - lastReading.value;

    const reading = await Reading.create({
      meter: meterId,
      user: req.user.id,
      value,
      unitsUsed,
      date: readingDate,
      note,
      source: source === 'photo' ? 'photo' : 'manual',
    });

    res.status(201).json(reading);
  } catch (error) {
    res.status(500).json({ message: 'Could not save reading', error: error.message });
  }
};

export const scanReading = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const extracted = await extractMeterReading(base64Image, req.file.mimetype);

    res.json({
      extractedValue: extracted.reading,
      confidence: extracted.confidence,
      issue: extracted.issue,
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not read meter from photo', error: error.message });
  }
};

export const getReadings = async (req, res) => {
  try {
    const { meterId, month, year } = req.query;

    if (!meterId) {
      return res.status(400).json({ message: 'meterId is required' });
    }

    const meter = await Meter.findOne({ _id: meterId, user: req.user.id });
    if (!meter) {
      return res.status(404).json({ message: 'Meter not found' });
    }

    const filter = { meter: meterId };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      filter.date = { $gte: start, $lt: end };
    }

    const readings = await Reading.find(filter).sort({ date: -1 });
    res.json(readings);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch readings', error: error.message });
  }
};

export const getLastReading = async (req, res) => {
  try {
    const { meterId } = req.params;

    const meter = await Meter.findOne({ _id: meterId, user: req.user.id });
    if (!meter) {
      return res.status(404).json({ message: 'Meter not found' });
    }

    const lastReading = await Reading.findOne({ meter: meterId }).sort({ date: -1 });
    res.json(lastReading || null);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch last reading', error: error.message });
  }
};

export const getMonthlySummary = async (req, res) => {
  try {
    const { meterId } = req.params;
    const { month, year } = req.query;

    const meter = await Meter.findOne({ _id: meterId, user: req.user.id });
    if (!meter) {
      return res.status(404).json({ message: 'Meter not found' });
    }

    const now = new Date();
    const targetMonthIndex = month ? Number(month) - 1 : now.getMonth();
    const targetYear = year ? Number(year) : now.getFullYear();

    const start = new Date(targetYear, targetMonthIndex, 1);
    const end = new Date(targetYear, targetMonthIndex + 1, 1);

    const readings = await Reading.find({
      meter: meterId,
      date: { $gte: start, $lt: end },
    });

    const totalUnitsUsed = readings.reduce((sum, r) => sum + r.unitsUsed, 0);

    res.json({
      month: monthNames[targetMonthIndex],
      year: targetYear,
      totalUnitsUsed,
      target: meter.target,
      overTarget: meter.target > 0 && totalUnitsUsed > meter.target,
      readingsCount: readings.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not calculate monthly summary', error: error.message });
  }
};

export const getCycleSummary = async (req, res) => {
  try {
    const { meterId } = req.params;

    const meter = await Meter.findOne({ _id: meterId, user: req.user.id });
    if (!meter) {
      return res.status(404).json({ message: 'Meter not found' });
    }

    const latestReading = await Reading.findOne({ meter: meterId }).sort({ date: -1 });
    const currentValue = latestReading ? latestReading.value : meter.lastBilledReading;

    const today = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysSinceBill = Math.max(0, Math.floor((today - meter.lastBilledDate) / msPerDay));
    const daysRemaining = Math.max(0, meter.billingCycleDays - daysSinceBill);

    const unitsUsed = currentValue - meter.lastBilledReading;
    const remainingTarget = meter.target - unitsUsed;

    const userAvgPerDay = daysSinceBill > 0 ? Number((unitsUsed / daysSinceBill).toFixed(2)) : 0;
    const requiredAvgPerDay = daysRemaining > 0 ? Number((remainingTarget / daysRemaining).toFixed(2)) : null;

    res.json({
      month: monthNames[today.getMonth()],
      year: today.getFullYear(),
      currentReading: currentValue,
      lastBilledReading: meter.lastBilledReading,
      lastBilledDate: meter.lastBilledDate,
      unitsUsed,
      daysSinceBill,
      daysRemaining,
      target: meter.target,
      remainingTarget,
      overTarget: meter.target > 0 && unitsUsed > meter.target,
      userAvgPerDay,
      requiredAvgPerDay,
      onTrack: requiredAvgPerDay === null ? null : userAvgPerDay <= requiredAvgPerDay,
    });
  } catch (error) {
    res.status(500).json({ message: 'Could not calculate cycle summary', error: error.message });
  }
};

export const deleteReading = async (req, res) => {
  try {
    const { id } = req.params;

    const reading = await Reading.findOne({ _id: id, user: req.user.id });
    if (!reading) {
      return res.status(404).json({ message: 'Reading not found' });
    }

    await reading.deleteOne();
    res.json({ message: 'Reading deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete reading', error: error.message });
  }
};