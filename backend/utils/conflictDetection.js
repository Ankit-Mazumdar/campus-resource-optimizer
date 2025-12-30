const Booking = require('../models/Booking');

/**
 * Advanced Conflict Detection Algorithm
 * Checks for booking conflicts considering:
 * - Same resource, same date, overlapping time
 * - Quantity availability for equipment/books
 */
const checkConflict = async (resourceId, bookingDate, startTime, endTime, quantity = 1, excludeBookingId = null) => {
  try {
    // Convert times to minutes for comparison
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const requestStart = timeToMinutes(startTime);
    const requestEnd = timeToMinutes(endTime);

    // Find all bookings for this resource on this date
    const query = {
      resource: resourceId,
      bookingDate: new Date(bookingDate),
      status: { $in: ['pending', 'confirmed'] }
    };

    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    const existingBookings = await Booking.find(query);

    // Check for time overlaps
    for (const booking of existingBookings) {
      const existingStart = timeToMinutes(booking.startTime);
      const existingEnd = timeToMinutes(booking.endTime);

      const hasOverlap = (requestStart < existingEnd && requestEnd > existingStart);

      if (hasOverlap) {
        // For equipment/books, check quantity
        if (quantity) {
          const totalBooked = existingBookings
            .filter(b => {
              const bStart = timeToMinutes(b.startTime);
              const bEnd = timeToMinutes(b.endTime);
              return (requestStart < bEnd && requestEnd > bStart);
            })
            .reduce((sum, b) => sum + (b.quantity || 1), 0);

          const Resource = require('../models/Resource');
          const resource = await Resource.findById(resourceId);
          
          if (totalBooked + quantity > resource.availableQuantity) {
            return {
              hasConflict: true,
              conflictingBooking: booking,
              reason: 'Insufficient quantity available for this time slot'
            };
          }
        } else {
          return {
            hasConflict: true,
            conflictingBooking: booking,
            reason: 'Resource already booked for this time slot'
          };
        }
      }
    }

    return { hasConflict: false };

  } catch (error) {
    console.error('Conflict detection error:', error);
    throw error;
  }
};

/**
 * Find available time slots for a resource on a given date
 */
const findAvailableSlots = async (resourceId, bookingDate) => {
  try {
    const bookings = await Booking.find({
      resource: resourceId,
      bookingDate: new Date(bookingDate),
      status: { $in: ['pending', 'confirmed'] }
    }).sort({ startTime: 1 });

    const workingHours = { start: '08:00', end: '20:00' };
    const availableSlots = [];
    let currentTime = workingHours.start;

    for (const booking of bookings) {
      if (currentTime < booking.startTime) {
        availableSlots.push({ startTime: currentTime, endTime: booking.startTime });
      }
      currentTime = booking.endTime;
    }

    if (currentTime < workingHours.end) {
      availableSlots.push({ startTime: currentTime, endTime: workingHours.end });
    }

    return availableSlots;

  } catch (error) {
    console.error('Error finding available slots:', error);
    throw error;
  }
};

/**
 * Predictive scheduling - suggest best time slots
 */
const suggestOptimalSlots = async (resourceId, preferredDate, duration = 60) => {
  try {
    const Resource = require('../models/Resource');
    const resource = await Resource.findById(resourceId);

    const historicalBookings = await Booking.find({
      resource: resourceId,
      status: 'completed',
      bookingDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const timeSlotUsage = {};
    historicalBookings.forEach(booking => {
      const hour = parseInt(booking.startTime.split(':')[0]);
      timeSlotUsage[hour] = (timeSlotUsage[hour] || 0) + 1;
    });

    const availableSlots = await findAvailableSlots(resourceId, preferredDate);
    const scoredSlots = availableSlots.map(slot => {
      const hour = parseInt(slot.startTime.split(':')[0]);
      const usageScore = timeSlotUsage[hour] || 0;
      return {
        ...slot,
        usageScore,
        recommendation: usageScore < 5 ? 'Highly Available' : 
                       usageScore < 10 ? 'Moderately Available' : 'Busy'
      };
    }).sort((a, b) => a.usageScore - b.usageScore);

    return scoredSlots;

  } catch (error) {
    console.error('Error suggesting optimal slots:', error);
    throw error;
  }
};

module.exports = {
  checkConflict,
  findAvailableSlots,
  suggestOptimalSlots
};
