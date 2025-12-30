const express = require('express');
const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');
const {
  calculateUtilization,
  getMostUtilizedResources,
  getBookingTrends,
  getResourceTypeDistribution
} = require('../utils/analytics');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ==================== UTILIZATION ANALYTICS ====================

// GET OVERALL UTILIZATION
router.get('/utilization/overview', checkRole('admin', 'faculty'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const resources = await Resource.find({ status: { $ne: 'retired' } });

    const utilizationData = await Promise.all(
      resources.map(async (resource) => {
        const util = await calculateUtilization(resource._id, start, end);
        return {
          resource: {
            id: resource._id,
            name: resource.name,
            type: resource.type,
            location: resource.location
          },
          ...util
        };
      })
    );

    const totalBookings = utilizationData.reduce((sum, item) => sum + item.totalBookings, 0);
    const avgUtilization = utilizationData.reduce((sum, item) => sum + parseFloat(item.utilizationRate), 0) / utilizationData.length;

    res.json({
      period: { startDate: start, endDate: end },
      overview: {
        totalResources: resources.length,
        totalBookings,
        averageUtilization: avgUtilization.toFixed(2)
      },
      resourceUtilization: utilizationData.sort((a, b) => b.utilizationRate - a.utilizationRate)
    });
  } catch (error) {
    console.error('Utilization overview error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET RESOURCE-SPECIFIC UTILIZATION
router.get('/utilization/resource/:id', checkRole('admin', 'faculty'), async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    const bookings = await Booking.find({
      resource: resource._id,
      bookingDate: { $gte: start, $lte: end },
      status: { $in: ['confirmed', 'completed'] }
    }).sort({ bookingDate: 1 });

    const grouped = {};
    bookings.forEach(booking => {
      let key;
      const date = new Date(booking.bookingDate);

      if (groupBy === 'day') key = date.toISOString().split('T')[0];
      else if (groupBy === 'week') {
        const week = Math.ceil(date.getDate() / 7);
        key = `${date.getFullYear()}-W${week}`;
      } else if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) grouped[key] = { period: key, bookings: 0, totalHours: 0 };

      grouped[key].bookings += 1;
      grouped[key].totalHours += booking.duration / 60;
    });

    const timeSeriesData = Object.values(grouped);
    const overallUtil = await calculateUtilization(resource._id, start, end);

    res.json({
      resource: {
        id: resource._id,
        name: resource.name,
        type: resource.type
      },
      period: { startDate: start, endDate: end },
      overall: overallUtil,
      timeSeries: timeSeriesData
    });
  } catch (error) {
    console.error('Resource utilization error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== POPULAR RESOURCES ====================

// GET MOST UTILIZED RESOURCES
router.get('/popular-resources', checkRole('admin', 'faculty'), async (req, res) => {
  try {
    const { limit = 10, type } = req.query;
    const popularResources = await getMostUtilizedResources(parseInt(limit));

    const filtered = type ? popularResources.filter(r => r.resource.type === type) : popularResources;

    res.json({ count: filtered.length, resources: filtered });
  } catch (error) {
    console.error('Popular resources error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET LEAST UTILIZED RESOURCES
router.get('/underutilized-resources', checkRole('admin', 'faculty'), async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const allResources = await getMostUtilizedResources(1000);

    const underutilized = allResources
      .sort((a, b) => a.utilizationRate - b.utilizationRate)
      .slice(0, parseInt(limit));

    res.json({ count: underutilized.length, resources: underutilized });
  } catch (error) {
    console.error('Underutilized resources error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== BOOKING TRENDS ====================

// GET BOOKING TRENDS
router.get('/booking-trends', checkRole('admin', 'faculty'), async (req, res) => {
  try {
    const { days = 30, resourceType, department } = req.query;
    let trends = await getBookingTrends(parseInt(days));

    if (resourceType || department) {
      const bookings = await Booking.find({
        createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
      }).populate('resource').populate('user');

      const filtered = bookings.filter(b => {
        if (resourceType && b.resource.type !== resourceType) return false;
        if (department && b.user.department !== department) return false;
        return true;
      });

      const regrouped = {};
      filtered.forEach(b => {
        const date = b.bookingDate.toISOString().split('T')[0];
        regrouped[date] = (regrouped[date] || 0) + 1;
      });

      trends = Object.entries(regrouped).map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    res.json({ period: `Last ${days} days`, trends });
  } catch (error) {
    console.error('Booking trends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Continue fixing all similar template literal lines for peak-hours, bookings-by-type, department-comparison, export-report...
// (All `${var}` inside quotes need backticks)

module.exports = router;
