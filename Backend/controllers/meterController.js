import Meter from '../models/Meter.js';
import Reading from '../models/Reading.js';

export const createMeter = async (req, res) => {
  try {
    const { name, meterNumber, target } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Meter name is required' });
    }

    const meter = await Meter.create({
      user: req.user.id,
      name,
      meterNumber,
      target: target || 0,
    });

    res.status(201).json(meter);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You already have a meter with this name' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Could not create meter', error: error.message });
  }
};

export const getMeters = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const filter = { user: req.user.id };
    if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    const meters = await Meter.find(filter).sort({ createdAt: -1 });
    res.json(meters);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch meters', error: error.message });
  }
};

export const getMeterById = async (req, res) => {
  try {
    const meter = await Meter.findOne({ _id: req.params.id, user: req.user.id });
    if (!meter) {
      return res.status(404).json({ message: 'Meter not found' });
    }
    res.json(meter);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch meter', error: error.message });
  }
};

export const updateMeter = async (req, res) => {
  try {
    const { name, meterNumber, target, isActive } = req.body;

    const meter = await Meter.findOne({ _id: req.params.id, user: req.user.id });
    if (!meter) {
      return res.status(404).json({ message: 'Meter not found' });
    }

    if (name !== undefined) meter.name = name;
    if (meterNumber !== undefined) meter.meterNumber = meterNumber;
    if (target !== undefined) meter.target = target;
    if (isActive !== undefined) meter.isActive = isActive;

    await meter.save();
    res.json(meter);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You already have a meter with this name' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Could not update meter', error: error.message });
  }
};

export const deleteMeter = async (req, res) => {
  try {
    const meter = await Meter.findOne({ _id: req.params.id, user: req.user.id });
    if (!meter) {
      return res.status(404).json({ message: 'Meter not found' });
    }

    await Reading.deleteMany({ meter: meter._id });
    await meter.deleteOne();

    res.json({ message: 'Meter and its readings deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete meter', error: error.message });
  }
};