// utils/analytics.js
const Booking = require('../models/Booking');
const Resource = require('../models/Resource');

/**
 * Calculate resource utilization rate
 */
const calculateUtilization = async (resourceId, startDate, endDate) => {
  try {
    const bookings = await Booking.find({
      resource: resourceId,
      bookingDate: { $gte: startDate, $lte: endDate },
      status: { $in: ['confirmed', 'completed'] }
    });

    // Calculate total booked minutes
    const totalBookedMinutes = bookings.reduce((sum, booking) => sum + booking.duration, 0);

    // Available minutes assuming 12 hours/day
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalAvailableMinutes = days * 12 * 60;

    const utilizationRate = (totalBookedMinutes / totalAvailableMinutes) * 100;

    return {
      totalBookings: bookings.length,
      totalBookedHours: (totalBookedMinutes / 60).toFixed(2),
      utilizationRate: utilizationRate.toFixed(2)
    };
  } catch (error) {
    console.error('Utilization calculation error:', error);
    throw error;
  }
};

/**
 * Get most utilized resources
 */
const getMostUtilizedResources = async (limit = 10) => {
  try {
    const resources = await Resource.find({ status: 'available' });

    const resourceStats = await Promise.all(
      resources.map(async (resource) => {
        const bookingCount = await Booking.countDocuments({
          resource: resource._id,
          status: { $in: ['confirmed', 'completed'] }
        });

        return {
          resource: {
            id: resource._id,
            name: resource.name,
            type: resource.type,
            location: resource.location
          },
          bookingCount,
          utilizationRate: resource.utilizationRate || 0
        };
      })
    );

    return resourceStats
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, limit);
  } catch (error) {
    console.error('Most utilized resources error:', error);
    throw error;
  }
};

/**
 * Get booking trends over time
 */
const getBookingTrends = async (days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bookings = await Booking.find({
      createdAt: { $gte: startDate }
    });

    const trendData = {};
    bookings.forEach((booking) => {
      const date = booking.bookingDate.toISOString().split('T')[0];
      trendData[date] = (trendData[date] || 0) + 1;
    });

    return Object.entries(trendData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error('Booking trends error:', error);
    throw error;
  }
};

/**
 * Get resource type distribution
 */
const getResourceTypeDistribution = async () => {
  try {
    const distribution = await Resource.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } }
        }
      }
    ]);

    return distribution.map((item) => ({
      type: item._id,
      total: item.count,
      available: item.available,
      occupied: item.count - item.available
    }));
  } catch (error) {
    console.error('Resource distribution error:', error);
    throw error;
  }
};

/**
 * Get user booking statistics
 */
const getUserBookingStats = async (userId) => {
  try {
    const totalBookings = await Booking.countDocuments({ user: userId });
    const activeBookings = await Booking.countDocuments({ 
      user: userId, 
      status: 'confirmed',
      bookingDate: { $gte: new Date() }
    });
    const completedBookings = await Booking.countDocuments({ 
      user: userId, 
      status: 'completed' 
    });
    const missedBookings = await Booking.countDocuments({ 
      user: userId, 
      status: 'missed' 
    });

    return {
      totalBookings,
      activeBookings,
      completedBookings,
      missedBookings,
      completionRate: totalBookings > 0 
        ? ((completedBookings / totalBookings) * 100).toFixed(2) 
        : 0
    };
  } catch (error) {
    console.error('User stats error:', error);
    throw error;
  }
};

module.exports = {
  calculateUtilization,
  getMostUtilizedResources,
  getBookingTrends,
  getResourceTypeDistribution,
  getUserBookingStats
};
