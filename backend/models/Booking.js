// const mongoose = require('mongoose');

// const bookingSchema = new mongoose.Schema(
//   {
//     bookingId: {
//       type: String,
//       unique: true
//     },

//     // 🔒 REQUIRED USER
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true
//     },

//     resource: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Resource',
//       required: true
//     },

//     bookingDate: {
//       type: Date,
//       required: true
//     },

//     startTime: {
//       type: String,
//       required: true
//     },

//     endTime: {
//       type: String,
//       required: true
//     },

//     status: {
//       type: String,
//       enum: ['confirmed', 'cancelled'],
//       default: 'confirmed'
//     }
//   },
//   { timestamps: true }
// );

// // 🔒 AUTO BOOKING ID
// bookingSchema.pre('save', function (next) {
//   if (!this.bookingId) {
//     this.bookingId = `BK-${Date.now()}`;
//   }
//   next();
// });

// module.exports = mongoose.model('Booking', bookingSchema);

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true
    },

    // 🔒 REQUIRED USER
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true
    },

    bookingDate: {
      type: Date,
      required: true
    },

    startTime: {
      type: String,
      required: true
    },

    endTime: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    }
  },
  { timestamps: true }
);

// 🔒 AUTO BOOKING ID
bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    this.bookingId = `BK-${Date.now()}`;
  }
  next();
});

// ✅ SAFE EXPORT TO AVOID OverwriteModelError
module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

