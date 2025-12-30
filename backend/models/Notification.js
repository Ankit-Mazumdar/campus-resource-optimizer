const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['booking_confirmed','booking_cancelled','reminder','approval_pending','approval_granted','approval_rejected','resource_available'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  emailSent: { type: Boolean, default: false },
  smsSent: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// Optional index for faster queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
