// const express = require('express');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const morgan = require('morgan');
// const connectDB = require('./config/db');

// Route imports
// const authRoutes = require('./routes/auth');
// const adminRoutes = require('./routes/admin');
// const facultyRoutes = require('./routes/faculty');
// const studentRoutes = require('./routes/student');
// const bookingRoutes = require('./routes/booking');
// const analyticsRoutes = require('./routes/analytics');

// Load environment variables
// dotenv.config();

// Connect to MongoDB
// connectDB();

// const app = express();

// Middlewares
// app.use(cors());
// app.use(express.json());
// app.use(morgan('dev'));

// Health check
// app.get('/', (req, res) => {
//   res.send('Campus Resource Optimizer API is running');
// });

// API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/faculty', facultyRoutes);
// app.use('/api/student', studentRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/analytics', analyticsRoutes);

// Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });
// ------------------------------------------------------------------------------------------------------

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const cron = require('node-cron');
// require('dotenv').config();

// // ==================== APP INIT ====================
// const app = express();

// // ==================== MIDDLEWARE ====================
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:3000',
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Request logging
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//   next();
// });

// // ==================== DATABASE CONNECTION ====================
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => {
//     console.log('✅ MongoDB Connected Successfully');
//     console.log(`📍 Database: ${mongoose.connection.name}`);
//   })
//   .catch(err => {
//     console.error('❌ MongoDB Connection Error:', err.message);
//     process.exit(1);
//   });

// mongoose.connection.on('error', err => console.error('MongoDB Error:', err));
// mongoose.connection.on('disconnected', () => console.log('MongoDB Disconnected'));

// // ==================== ROUTES ====================
// const authRoutes = require('./routes/auth');
// const bookingRoutes = require('./routes/booking');
// const adminRoutes = require('./routes/admin');
// const facultyRoutes = require('./routes/faculty');
// const studentRoutes = require('./routes/student');
// const analyticsRoutes = require('./routes/analytics');

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/bookings', bookingRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/faculty', facultyRoutes);
// app.use('/api/student', studentRoutes);
// app.use('/api/analytics', analyticsRoutes);

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({
//     status: 'healthy',
//     timestamp: new Date(),
//     database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
//     uptime: process.uptime()
//   });
// });

// // Test endpoint
// app.get('/api/test', (req, res) => {
//   res.json({
//     message: 'Campus Resource Optimizer API is running!',
//     version: '1.0.0',
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // ==================== CRON JOBS ====================
// const Booking = require('./models/Booking');
// const User = require('./models/User');
// const Resource = require('./models/Resource');
// const { sendBookingReminder } = require('./utils/emailService');
// const { calculateUtilization } = require('./utils/analytics');

// // 1. Send booking reminders every hour
// cron.schedule('0 * * * *', async () => {
//   try {
//     console.log('🔔 Running reminder check...');
//     const now = new Date();
//     const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

//     const upcomingBookings = await Booking.find({
//       bookingDate: {
//         $gte: new Date(now.setHours(0, 0, 0, 0)),
//         $lt: new Date(now.setHours(23, 59, 59, 999))
//       },
//       status: 'confirmed',
//       reminderSent: false
//     }).populate('user').populate('resource');

//     for (const booking of upcomingBookings) {
//       const [hours, minutes] = booking.startTime.split(':').map(Number);
//       const bookingTime = new Date(booking.bookingDate);
//       bookingTime.setHours(hours, minutes);

//       if (bookingTime >= now && bookingTime <= oneHourLater) {
//         await sendBookingReminder(booking, booking.user);
//         booking.reminderSent = true;
//         await booking.save();
//         console.log(`✅ Reminder sent for booking ${booking._id}`);
//       }
//     }
//   } catch (error) {
//     console.error('❌ Reminder task error:', error);
//   }
// });

// // 2. Mark missed bookings every 30 minutes
// cron.schedule('*/30 * * * *', async () => {
//   try {
//     console.log('🔍 Checking for missed bookings...');
//     const now = new Date();

//     const missedBookings = await Booking.find({
//       status: 'confirmed',
//       bookingDate: { $lt: now },
//       checkedIn: false
//     }).populate('user').populate('resource');

//     for (const booking of missedBookings) {
//       const [hours, minutes] = booking.startTime.split(':').map(Number);
//       const bookingTime = new Date(booking.bookingDate);
//       bookingTime.setHours(hours, minutes);

//       const gracePeriod = new Date(bookingTime.getTime() + 15 * 60 * 1000);
//       if (now > gracePeriod) {
//         booking.status = 'missed';
//         await booking.save();

//         booking.user.missedBookings += 1;
//         if (booking.user.activeBookings > 0) booking.user.activeBookings -= 1;
//         if (booking.user.missedBookings >= 3) booking.user.penaltyStatus = true;
//         await booking.user.save();

//         if (!['equipment', 'book'].includes(booking.resource.type)) {
//           booking.resource.status = 'available';
//           await booking.resource.save();
//         }

//         console.log(`⚠️ Booking ${booking._id} marked as missed`);
//       }
//     }
//   } catch (error) {
//     console.error('❌ Missed booking check error:', error);
//   }
// });

// // 3. Complete checked-out bookings every hour
// cron.schedule('0 * * * *', async () => {
//   try {
//     console.log('✅ Checking for completed bookings...');
//     const now = new Date();

//     const endedBookings = await Booking.find({
//       status: 'confirmed',
//       checkedIn: true,
//       checkedOut: false,
//       bookingDate: { $lt: now }
//     });

//     for (const booking of endedBookings) {
//       const [hours, minutes] = booking.endTime.split(':').map(Number);
//       const endTime = new Date(booking.bookingDate);
//       endTime.setHours(hours, minutes);

//       if (now > endTime) {
//         booking.status = 'completed';
//         booking.checkedOut = true;
//         booking.checkOutTime = endTime;
//         await booking.save();
//         console.log(`✅ Booking ${booking._id} auto-completed`);
//       }
//     }
//   } catch (error) {
//     console.error('❌ Complete booking check error:', error);
//   }
// });

// // 4. Calculate resource utilization daily at midnight
// cron.schedule('0 0 * * *', async () => {
//   try {
//     console.log('📊 Calculating resource utilization...');
//     const resources = await Resource.find({ status: { $ne: 'retired' } });

//     const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
//     const today = new Date();

//     for (const resource of resources) {
//       const util = await calculateUtilization(resource._id, last30Days, today);
//       resource.utilizationRate = parseFloat(util.utilizationRate);
//       await resource.save();
//     }

//     console.log('✅ Utilization rates updated');
//   } catch (error) {
//     console.error('❌ Utilization calculation error:', error);
//   }
// });

// // ==================== ERROR HANDLING ====================
// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ error: 'Route not found', path: req.path });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('Error:', err);
//   res.status(err.status || 500).json({
//     error: err.message || 'Internal server error',
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// });

// // ==================== START SERVER ====================
// const PORT = process.env.PORT || 5000;
// const server = app.listen(PORT, () => {
//   console.log('');
//   console.log('================================================');
//   console.log('🚀 Campus Resource Optimizer Server');
//   console.log('================================================');
//   console.log(`📡 Server running on http://localhost:${PORT}`);
//   console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : '❌ Missing'}`);
//   console.log(`📧 Email Service: ${process.env.EMAIL_USER ? 'Configured' : '❌ Missing'}`);
//   console.log('================================================');
// });

// // Graceful shutdown
// ['SIGTERM', 'SIGINT'].forEach(signal => {
//   process.on(signal, () => {
//     console.log(`\n${signal} received. Closing server...`);
//     server.close(() => {
//       console.log('Server closed');
//       mongoose.connection.close(false, () => {
//         console.log('MongoDB connection closed');
//         process.exit(0);
//       });
//     });
//   });
// });

// module.exports = app;

//-----------------------------------------------------------------------------

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const cron = require('node-cron');
// require('dotenv').config();

// // ==================== APP INIT ====================
// const app = express();

// // ==================== MIDDLEWARE ====================
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:3000',
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Request logging
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//   next();
// });

// // ==================== DATABASE CONNECTION ====================
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => {
//     console.log('✅ MongoDB Connected Successfully');
//     console.log(`📍 Database: ${mongoose.connection.name}`);
//   })
//   .catch(err => {
//     console.error('❌ MongoDB Connection Error:', err.message);
//     process.exit(1);
//   });

// mongoose.connection.on('error', err => console.error('MongoDB Error:', err));
// mongoose.connection.on('disconnected', () => console.log('MongoDB Disconnected'));

// // ==================== ROUTES ====================
// const authRoutes = require('./routes/auth');
// const bookingRoutes = require('./routes/booking');
// const adminRoutes = require('./routes/admin');
// const facultyRoutes = require('./routes/faculty');
// const studentRoutes = require('./routes/student');
// const analyticsRoutes = require('./routes/analytics');

// /**
//  * DEBUG LOGS: 
//  * If your server crashes, look at these lines in your terminal.
//  * If any of them say 'object', go to that file and add 'module.exports = router;' at the end.
//  */
// console.log('--- Checking Route Exports ---');
// console.log('Auth Routes Type:', typeof authRoutes);
// console.log('Booking Routes Type:', typeof bookingRoutes);
// console.log('Admin Routes Type:', typeof adminRoutes);
// console.log('------------------------------');

// // API Routes
// // We use a safe check to ensure the imported route is a function/router
// if (typeof authRoutes === 'function') app.use('/api/auth', authRoutes);
// if (typeof bookingRoutes === 'function') app.use('/api/bookings', bookingRoutes);
// if (typeof adminRoutes === 'function') app.use('/api/admin', adminRoutes);
// if (typeof facultyRoutes === 'function') app.use('/api/faculty', facultyRoutes);
// if (typeof studentRoutes === 'function') app.use('/api/student', studentRoutes);
// if (typeof analyticsRoutes === 'function') app.use('/api/analytics', analyticsRoutes);

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({
//     status: 'healthy',
//     timestamp: new Date(),
//     database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
//     uptime: process.uptime()
//   });
// });

// // Test endpoint
// app.get('/api/test', (req, res) => {
//   res.json({
//     message: 'Campus Resource Optimizer API is running!',
//     version: '1.0.0',
//     environment: process.env.NODE_ENV || 'development'
//   });
// });

// // ==================== CRON JOBS ====================
// const Booking = require('./models/Booking');
// const User = require('./models/User');
// const Resource = require('./models/Resource');
// const { sendBookingReminder } = require('./utils/emailService');
// const { calculateUtilization } = require('./utils/analytics');

// // 1. Send booking reminders every hour
// cron.schedule('0 * * * *', async () => {
//   try {
//     console.log('🔔 Running reminder check...');
//     const now = new Date();
//     const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

//     const upcomingBookings = await Booking.find({
//       bookingDate: {
//         $gte: new Date(new Date().setHours(0, 0, 0, 0)),
//         $lt: new Date(new Date().setHours(23, 59, 59, 999))
//       },
//       status: 'confirmed',
//       reminderSent: false
//     }).populate('user').populate('resource');

//     for (const booking of upcomingBookings) {
//       const [hours, minutes] = booking.startTime.split(':').map(Number);
//       const bookingTime = new Date(booking.bookingDate);
//       bookingTime.setHours(hours, minutes);

//       if (bookingTime >= now && bookingTime <= oneHourLater) {
//         await sendBookingReminder(booking, booking.user);
//         booking.reminderSent = true;
//         await booking.save();
//         console.log(`✅ Reminder sent for booking ${booking._id}`);
//       }
//     }
//   } catch (error) {
//     console.error('❌ Reminder task error:', error);
//   }
// });

// // 2. Mark missed bookings every 30 minutes
// cron.schedule('*/30 * * * *', async () => {
//   try {
//     console.log('🔍 Checking for missed bookings...');
//     const now = new Date();

//     const missedBookings = await Booking.find({
//       status: 'confirmed',
//       bookingDate: { $lt: now },
//       checkedIn: false
//     }).populate('user').populate('resource');

//     for (const booking of missedBookings) {
//       const [hours, minutes] = booking.startTime.split(':').map(Number);
//       const bookingTime = new Date(booking.bookingDate);
//       bookingTime.setHours(hours, minutes);

//       const gracePeriod = new Date(bookingTime.getTime() + 15 * 60 * 1000);
//       if (now > gracePeriod) {
//         booking.status = 'missed';
//         await booking.save();

//         if (booking.user) {
//           booking.user.missedBookings = (booking.user.missedBookings || 0) + 1;
//           if (booking.user.activeBookings > 0) booking.user.activeBookings -= 1;
//           if (booking.user.missedBookings >= 3) booking.user.penaltyStatus = true;
//           await booking.user.save();
//         }

//         if (booking.resource && !['equipment', 'book'].includes(booking.resource.type)) {
//           booking.resource.status = 'available';
//           await booking.resource.save();
//         }

//         console.log(`⚠️ Booking ${booking._id} marked as missed`);
//       }
//     }
//   } catch (error) {
//     console.error('❌ Missed booking check error:', error);
//   }
// });

// // ==================== ERROR HANDLING ====================
// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ error: 'Route not found', path: req.path });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('Error:', err);
//   res.status(err.status || 500).json({
//     error: err.message || 'Internal server error',
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
//   });
// });

// // ==================== START SERVER ====================
// const PORT = process.env.PORT || 5000;
// const server = app.listen(PORT, () => {
//   console.log('');
//   console.log('================================================');
//   console.log('🚀 Campus Resource Optimizer Server');
//   console.log('================================================');
//   console.log(`📡 Server running on http://localhost:${PORT}`);
//   console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configured' : '❌ Missing'}`);
//   console.log('================================================');
// });

// // Graceful shutdown
// ['SIGTERM', 'SIGINT'].forEach(signal => {
//   process.on(signal, () => {
//     console.log(`\n${signal} received. Closing server...`);
//     server.close(() => {
//       console.log('Server closed');
//       mongoose.connection.close(false, () => {
//         console.log('MongoDB connection closed');
//         process.exit(0);
//       });
//     });
//   });
// });

// module.exports = app;

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

// ==================== APP INIT ====================
const app = express();

// ==================== MIDDLEWARE ====================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:8080", // ✅ Vite frontend
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// ==================== DATABASE CONNECTION ====================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    console.log(`📍 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

mongoose.connection.on("error", (err) =>
  console.error("MongoDB Error:", err)
);
mongoose.connection.on("disconnected", () =>
  console.log("MongoDB Disconnected")
);

// ==================== ROUTES ====================
const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/booking");
const adminRoutes = require("./routes/admin");
const facultyRoutes = require("./routes/faculty");
const studentRoutes = require("./routes/student");
const analyticsRoutes = require("./routes/analytics");

// ==================== API ROUTE MOUNTING ====================
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/analytics", analyticsRoutes);

// ==================== HEALTH & TEST ====================
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date(),
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
    uptime: process.uptime(),
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Campus Resource Optimizer API is running!",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// ==================== CRON JOBS ====================
const Booking = require("./models/Booking");
const User = require("./models/User");
const Resource = require("./models/Resource");
const { sendBookingReminder } = require("./utils/emailService");
const { calculateUtilization } = require("./utils/analytics");

// 🔔 Send booking reminders every hour
cron.schedule("0 * * * *", async () => {
  try {
    console.log("🔔 Running reminder check...");
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const bookings = await Booking.find({
      bookingDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
      status: "confirmed",
      reminderSent: false,
    })
      .populate("user")
      .populate("resource");

    for (const booking of bookings) {
      const [h, m] = booking.startTime.split(":").map(Number);
      const bookingTime = new Date(booking.bookingDate);
      bookingTime.setHours(h, m);

      if (bookingTime >= now && bookingTime <= oneHourLater) {
        await sendBookingReminder(booking, booking.user);
        booking.reminderSent = true;
        await booking.save();
        console.log(`✅ Reminder sent for booking ${booking._id}`);
      }
    }
  } catch (err) {
    console.error("❌ Reminder task error:", err);
  }
});

// ⚠️ Mark missed bookings every 30 minutes
cron.schedule("*/30 * * * *", async () => {
  try {
    console.log("🔍 Checking for missed bookings...");
    const now = new Date();

    const missedBookings = await Booking.find({
      status: "confirmed",
      checkedIn: false,
    })
      .populate("user")
      .populate("resource");

    for (const booking of missedBookings) {
      const [h, m] = booking.startTime.split(":").map(Number);
      const bookingTime = new Date(booking.bookingDate);
      bookingTime.setHours(h, m);

      const gracePeriod = new Date(
        bookingTime.getTime() + 15 * 60 * 1000
      );

      if (now > gracePeriod) {
        booking.status = "missed";
        await booking.save();

        if (booking.user) {
          booking.user.missedBookings =
            (booking.user.missedBookings || 0) + 1;
          booking.user.activeBookings = Math.max(
            0,
            (booking.user.activeBookings || 0) - 1
          );
          if (booking.user.missedBookings >= 3) {
            booking.user.penaltyStatus = true;
          }
          await booking.user.save();
        }

        if (
          booking.resource &&
          !["equipment", "book"].includes(booking.resource.type)
        ) {
          booking.resource.status = "available";
          await booking.resource.save();
        }

        console.log(`⚠️ Booking ${booking._id} marked as missed`);
      }
    }
  } catch (err) {
    console.error("❌ Missed booking check error:", err);
  }
});

// ==================== ERROR HANDLING ====================
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log("================================================");
  console.log("🚀 Campus Resource Optimizer Server Started");
  console.log(`📡 Backend: http://localhost:${PORT}`);
  console.log(
    `🌐 Frontend: ${process.env.CLIENT_URL || "http://localhost:8080"}`
  );
  console.log(
    `🔐 JWT: ${process.env.JWT_SECRET ? "Configured" : "❌ Missing"}`
  );
  console.log("================================================");
});

// ==================== GRACEFUL SHUTDOWN ====================
["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    console.log(`\n${signal} received. Shutting down...`);
    server.close(() => {
      mongoose.connection.close(false, () => {
        console.log("MongoDB connection closed");
        process.exit(0);
      });
    });
  });
});

module.exports = app;

