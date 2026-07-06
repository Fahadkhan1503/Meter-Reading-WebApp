import express from 'express';
import {
  createMeter,
  getMeters,
  getMeterById,
  updateMeter,
  deleteMeter,
} from '../controllers/meterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/meters
 * @desc    Create a new meter
 * @access  Private
 */
router.post('/', protect, createMeter);

/**
 * @route   GET /api/meters
 * @desc    Get all meters for the logged in user
 * @access  Private
 */
router.get('/', protect, getMeters);

/**
 * @route   GET /api/meters/:id
 * @desc    Get a single meter by id
 * @access  Private
 */
router.get('/:id', protect, getMeterById);

/**
 * @route   PATCH /api/meters/:id
 * @desc    Update a meter (name, target, meterNumber, isActive)
 * @access  Private
 */
router.patch('/:id', protect, updateMeter);

/**
 * @route   DELETE /api/meters/:id
 * @desc    Delete a meter and all its readings
 * @access  Private
 */
router.delete('/:id', protect, deleteMeter);

export default router;