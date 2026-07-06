import express from 'express';
import multer from 'multer';
import {
  createReading,
  scanReading,
  getReadings,
  getLastReading,
  getMonthlySummary,
  deleteReading,
} from '../controllers/readingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * @route   POST /api/readings
 * @desc    Save a reading, manual entry or confirmed photo scan
 * @access  Private
 */
router.post('/', protect, createReading);

/**
 * @route   POST /api/readings/scan
 * @desc    Extract a reading value from an uploaded photo, does not save
 * @access  Private
 */
router.post('/scan', protect, upload.single('image'), scanReading);

/**
 * @route   GET /api/readings
 * @desc    Get readings for a meter, optional month and year filter
 * @access  Private
 */
router.get('/', protect, getReadings);

/**
 * @route   GET /api/readings/last/:meterId
 * @desc    Get the most recent reading for a meter
 * @access  Private
 */
router.get('/last/:meterId', protect, getLastReading);

/**
 * @route   GET /api/readings/summary/:meterId
 * @desc    Get total units used and target comparison for a month
 * @access  Private
 */
router.get('/summary/:meterId', protect, getMonthlySummary);

/**
 * @route   DELETE /api/readings/:id
 * @desc    Delete a reading
 * @access  Private
 */
router.delete('/:id', protect, deleteReading);

export default router;