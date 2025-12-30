const express = require('express');
const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

const router = express.Router();

// All routes require authentication
router.use(authenticate);
router.use(checkRole('faculty'));

// ==================== BOOKING MANAGEMENT ====================

// CREATE NEW BOOKING
router.post('/bookings', async (req, res) => {
  try {
    const { resourceId, startTime, endTime, purpose } = req.body;

    const resource = await Resource.findById(resourceId);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    const booking = new Booking({
      user: req.user._id,
      resource: resource._id,
      startTime,
      endTime,
      purpose,
      status: 'pending',
      bookingDate: new Date()
    });

    await booking.save();

    // Update user activeBookings
    req.user.activeBookings += 1;
    await req.user.save();

    res.status(201).json({ message: 'Booking request created', booking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// VIEW FACULTY BOOKINGS
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('resource', 'name type location')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// CANCEL BOOKING
router.patch('/bookings/:id/cancel', async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (booking.status === 'confirmed') return res.status(400).json({ error: 'Cannot cancel confirmed booking' });

    booking.status = 'cancelled';
    await booking.save();

    if (req.user.activeBookings > 0) {
      req.user.activeBookings -= 1;
      await req.user.save();
    }

    res.json({ message: 'Booking cancelled', booking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== DASHBOARD ====================

// GET FACULTY DASHBOARD
router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ user: req.user._id });
    const activeBookings = await Booking.countDocuments({ user: req.user._id, status: 'confirmed' });
    const missedBookings = await Booking.countDocuments({ user: req.user._id, status: 'missed' });

    res.json({
      stats: {
        totalBookings,
        activeBookings,
        missedBookings,
        penaltyStatus: req.user.penaltyStatus
      }
    });
  } catch (error) {
    console.error('Faculty dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
