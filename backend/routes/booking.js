// const express = require('express');
// const router = express.Router();

// // Models
// const Booking = require('../models/Booking');
// const Resource = require('../models/Resource');
// const User = require('../models/User');
// const Notification = require('../models/Notification');

// // Middleware & Utilities
// const authenticate = require('../middleware/auth');
// const { 
//     checkConflict, 
//     findAvailableSlots, 
//     suggestOptimalSlots 
// } = require('../utils/conflictDetection');
// const { 
//     sendBookingConfirmation, 
//     sendBookingReminder, 
//     sendCancellationEmail 
// } = require('../utils/emailService');

// // ==================== GET ALL RESOURCES ====================
// router.get('/resources', authenticate, async (req, res) => {
//     try {
//         const { type, search, department, status } = req.query;
//         const query = {};

//         if (type) query.type = type;
//         query.status = status || 'available';

//         if (search) {
//             query.$or = [
//                 { name: { $regex: search, $options: 'i' } },
//                 { description: { $regex: search, $options: 'i' } }
//             ];
//         }

//         // Filter by user permissions
//         const user = req.user;
//         if (user.role === 'student') {
//             query.$or = [
//                 { allowedRoles: 'student' },
//                 { allowedRoles: { $size: 0 } }
//             ];

//             if (user.department) {
//                 query.$and = [
//                     {
//                         $or: [
//                             { allowedDepartments: user.department },
//                             { allowedDepartments: { $size: 0 } }
//                         ]
//                     },
//                     {
//                         $or: [
//                             { allowedYears: user.year },
//                             { allowedYears: { $size: 0 } }
//                         ]
//                     }
//                 ];
//             }
//         }

//         if (department) {
//             query.allowedDepartments = department;
//         }

//         const resources = await Resource.find(query)
//             .populate('faculty', 'name email')
//             .sort({ name: 1 });

//         res.json({ count: resources.length, resources });
//     } catch (error) {
//         console.error('Get resources error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ==================== GET SINGLE RESOURCE ====================
// router.get('/resources/:id', authenticate, async (req, res) => {
//     try {
//         const resource = await Resource.findById(req.params.id)
//             .populate('faculty', 'name email department');

//         if (!resource) {
//             return res.status(404).json({ error: 'Resource not found' });
//         }

//         const upcomingBookings = await Booking.find({
//             resource: resource._id,
//             status: { $in: ['confirmed', 'pending'] },
//             bookingDate: { $gte: new Date() }
//         })
//             .populate('user', 'name email')
//             .sort({ bookingDate: 1, startTime: 1 })
//             .limit(10);

//         res.json({ resource, upcomingBookings });
//     } catch (error) {
//         console.error('Get resource error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ==================== GET AVAILABLE SLOTS ====================
// router.get('/resources/:id/available-slots', authenticate, async (req, res) => {
//     try {
//         const { date } = req.query;
//         if (!date) {
//             return res.status(400).json({ error: 'Date parameter required' });
//         }
//         const availableSlots = await findAvailableSlots(req.params.id, date);
//         res.json({ date, availableSlots });
//     } catch (error) {
//         console.error('Available slots error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ==================== GET OPTIMAL SLOT SUGGESTIONS ====================
// router.get('/resources/:id/suggest-slots', authenticate, async (req, res) => {
//     try {
//         const { date, duration } = req.query;
//         if (!date) {
//             return res.status(400).json({ error: 'Date parameter required' });
//         }
//         const suggestions = await suggestOptimalSlots(
//             req.params.id,
//             date,
//             parseInt(duration) || 60
//         );
//         res.json({ date, suggestions });
//     } catch (error) {
//         console.error('Suggest slots error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ==================== CREATE BOOKING ====================
// router.post('/bookings', authenticate, async (req, res) => {
//     try {
//         const { resourceId, bookingDate, startTime, endTime, purpose, quantity } = req.body;

//         if (!resourceId || !bookingDate || !startTime || !endTime) {
//             return res.status(400).json({ error: 'Missing required fields' });
//         }

//         const resource = await Resource.findById(resourceId);
//         if (!resource) {
//             return res.status(404).json({ error: 'Resource not found' });
//         }

//         if (resource.status !== 'available') {
//             return res.status(400).json({ error: 'Resource is not available' });
//         }

//         const user = req.user;

//         // Role/Department/Year Validation
//         if (resource.allowedRoles.length > 0 && !resource.allowedRoles.includes(user.role)) {
//             return res.status(403).json({ error: 'You do not have permission to book this' });
//         }

//         if (user.role === 'student') {
//             if (resource.allowedDepartments.length > 0 && !resource.allowedDepartments.includes(user.department)) {
//                 return res.status(403).json({ error: 'Resource not available for your department' });
//             }
//             if (resource.allowedYears.length > 0 && !resource.allowedYears.includes(user.year)) {
//                 return res.status(403).json({ error: 'Resource not available for your year' });
//             }
//             if (user.activeBookings >= 3) {
//                 return res.status(400).json({ error: 'Maximum 3 active bookings allowed' });
//             }
//         }

//         // Conflict Detection
//         const bookingQuantity = quantity || 1;
//         const conflict = await checkConflict(resourceId, bookingDate, startTime, endTime, bookingQuantity);
        
//         if (conflict.hasConflict) {
//             return res.status(409).json({ 
//                 error: 'Booking conflict detected', 
//                 details: conflict.reason, 
//                 conflictingBooking: conflict.conflictingBooking 
//             });
//         }

//         // Calculate duration
//         const timeToMinutes = (time) => {
//             const [hours, minutes] = time.split(':').map(Number);
//             return hours * 60 + minutes;
//         };
//         const duration = timeToMinutes(endTime) - timeToMinutes(startTime);

//         if (duration <= 0) {
//             return res.status(400).json({ error: 'End time must be after start time' });
//         }

//         const booking = new Booking({
//             user: user._id,
//             resource: resourceId,
//             bookingDate: new Date(bookingDate),
//             startTime,
//             endTime,
//             duration,
//             purpose,
//             quantity: bookingQuantity,
//             status: 'confirmed'
//         });

//         await booking.save();

//         // Update stats
//         user.activeBookings += 1;
//         user.totalBookings += 1;
//         await user.save();

//         resource.totalBookings += 1;
//         if (resource.type !== 'equipment' && resource.type !== 'book') {
//             resource.status = 'occupied';
//         }
//         await resource.save();

//         await booking.populate([
//             { path: 'user', select: 'name email role' },
//             { path: 'resource', select: 'name type location' }
//         ]);

//         // Post-booking Actions
//         sendBookingConfirmation(booking, user);
        
//         const notification = new Notification({
//             user: user._id,
//             type: 'booking_confirmed',
//             title: 'Booking Confirmed',
//             message: `Your booking for ${resource.name} has been confirmed`,
//             booking: booking._id
//         });
//         await notification.save();

//         res.status(201).json({ message: 'Booking created successfully', booking });
//     } catch (error) {
//         console.error('Create booking error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ==================== GET MY BOOKINGS ====================
// router.get('/my-bookings', authenticate, async (req, res) => {
//     try {
//         const { status, upcoming } = req.query;
//         const query = { user: req.user._id };

//         if (status) query.status = status;
//         if (upcoming === 'true') {
//             query.bookingDate = { $gte: new Date() };
//             query.status = { $in: ['confirmed', 'pending'] };
//         }

//         const bookings = await Booking.find(query)
//             .populate('resource')
//             .sort({ bookingDate: -1, startTime: -1 });

//         res.json({ count: bookings.length, bookings });
//     } catch (error) {
//         console.error('Get bookings error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ==================== GET ALL BOOKINGS (Admin/Faculty) ====================
// router.get('/bookings', authenticate, async (req, res) => {
//     try {
//         if (req.user.role === 'student') {
//             return res.status(403).json({ error: 'Access denied' });
//         }

//         const { status, resource, date, user } = req.query;
//         const query = {};

//         if (status) query.status = status;
//         if (resource) query.resource = resource;
//         if (user) query.user = user;
//         if (date) query.bookingDate = new Date(date);

//         const bookings = await Booking.find(query)
//             .populate('user', 'name email role department')
//             .populate('resource', 'name type location')
//             .sort({ bookingDate: -1, startTime: -1 });

//         res.json({ count: bookings.length, bookings });
//     } catch (error) {
//         console.error('Get all bookings error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ==================== GET SINGLE BOOKING ====================
// router.get('/bookings/:id', authenticate, async (req, res) => {
//     try {
//         const booking = await Booking.findById(req.params.id)
//             .populate('user', 'name email role')
//             .populate('resource')
//             .populate('approvedBy', 'name email');

//         if (!booking) {
//             return res.status(404).json({ error: 'Booking not found' });
//         }

//         if (req.user.role === 'student' && booking.user._id.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ error: 'Access denied' });
//         }

//         res.json({ booking });
//     } catch (error) {
//         console.error('Get booking error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ==================== CANCEL BOOKING ====================
// router.delete('/bookings/:id', authenticate, async (req, res) => {
//     try {
//         const booking = await Booking.findById(req.params.id)
//             .populate('resource')
//             .populate('user');

//         if (!booking) return res.status(404).json({ error: 'Booking not found' });

//         const isOwner = booking.user._id.toString() === req.user._id.toString();
//         const isAdmin = req.user.role === 'admin';

//         if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Access denied' });
//         if (booking.status === 'cancelled') return res.status(400).json({ error: 'Already cancelled' });
//         if (booking.status === 'completed') return res.status(400).json({ error: 'Cannot cancel completed' });

//         booking.status = 'cancelled';
//         await booking.save();

//         if (booking.user.activeBookings > 0) {
//             booking.user.activeBookings -= 1;
//             await booking.user.save();
//         }

//         if (booking.resource.type !== 'equipment' && booking.resource.type !== 'book') {
//             booking.resource.status = 'available';
//             await booking.resource.save();
//         }

//         sendCancellationEmail(booking, booking.user);

//         const notification = new Notification({
//             user: booking.user._id,
//             type: 'booking_cancelled',
//             title: 'Booking Cancelled',
//             message: `Your booking for ${booking.resource.name} has been cancelled`,
//             booking: booking._id
//         });
//         await notification.save();

//         res.json({ message: 'Booking cancelled successfully', booking });
//     } catch (error) {
//         console.error('Cancel booking error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ==================== CHECK-IN ====================
// router.post('/bookings/:id/checkin', authenticate, async (req, res) => {
//     try {
//         const booking = await Booking.findById(req.params.id);
//         if (!booking) return res.status(404).json({ error: 'Booking not found' });

//         if (booking.user.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ error: 'Access denied' });
//         }
//         if (booking.checkedIn) return res.status(400).json({ error: 'Already checked in' });

//         const today = new Date().toDateString();
//         const bookingDay = booking.bookingDate.toDateString();
//         if (today !== bookingDay) {
//             return res.status(400).json({ error: 'Can only check in on booking date' });
//         }

//         booking.checkedIn = true;
//         booking.checkInTime = new Date();
//         await booking.save();

//         res.json({ message: 'Checked in successfully', booking });
//     } catch (error) {
//         console.error('Check-in error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ==================== CHECK-OUT ====================
// router.post('/bookings/:id/checkout', authenticate, async (req, res) => {
//     try {
//         const booking = await Booking.findById(req.params.id)
//             .populate('user')
//             .populate('resource');

//         if (!booking) return res.status(404).json({ error: 'Booking not found' });
//         if (booking.user._id.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ error: 'Access denied' });
//         }
//         if (!booking.checkedIn) return res.status(400).json({ error: 'Must check in first' });
//         if (booking.checkedOut) return res.status(400).json({ error: 'Already checked out' });

//         booking.checkedOut = true;
//         booking.checkOutTime = new Date();
//         booking.status = 'completed';
//         await booking.save();

//         if (booking.user.activeBookings > 0) {
//             booking.user.activeBookings -= 1;
//             await booking.user.save();
//         }

//         if (booking.resource.type !== 'equipment' && booking.resource.type !== 'book') {
//             booking.resource.status = 'available';
//             await booking.resource.save();
//         }

//         res.json({ message: 'Checked out successfully', booking });
//     } catch (error) {
//         console.error('Check-out error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ==================== CALENDAR VIEW ====================
// router.get('/calendar', authenticate, async (req, res) => {
//     try {
//         const { start, end, resource } = req.query;
//         const query = {};

//         if (start && end) {
//             query.bookingDate = { $gte: new Date(start), $lte: new Date(end) };
//         }
//         if (resource) query.resource = resource;
//         query.status = { $in: ['confirmed', 'pending'] };

//         const bookings = await Booking.find(query)
//             .populate('user', 'name')
//             .populate('resource', 'name type location');

//         const events = bookings.map((booking) => ({
//             id: booking._id,
//             title: `${booking.resource.name} - ${booking.user.name}`,
//             start: `${booking.bookingDate.toISOString().split('T')[0]}T${booking.startTime}`,
//             end: `${booking.bookingDate.toISOString().split('T')[0]}T${booking.endTime}`,
//             resourceType: booking.resource.type,
//             location: booking.resource.location,
//             status: booking.status
//         }));

//         res.json({ events });
//     } catch (error) {
//         console.error('Calendar error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// module.exports = router;

// const express = require('express');
// const router = express.Router();

// // Models
// const Booking = require('../models/Booking');
// const Resource = require('../models/Resource');
// const User = require('../models/User');
// const Notification = require('../models/Notification');

// // Middleware & Utilities
// const authenticate = require('../middleware/auth');
// const { 
//     checkConflict, 
//     findAvailableSlots, 
//     suggestOptimalSlots 
// } = require('../utils/conflictDetection');
// const { 
//     sendBookingConfirmation, 
//     sendBookingReminder, 
//     sendCancellationEmail 
// } = require('../utils/emailService');

// // ==================== GET ALL RESOURCES ====================
// router.get('/resources', authenticate, async (req, res) => {
//     try {
//         const { type, search, department, status } = req.query;
//         const query = {};

//         if (type) query.type = type;
//         query.status = status || 'available';

//         if (search) {
//             query.$or = [
//                 { name: { $regex: search, $options: 'i' } },
//                 { description: { $regex: search, $options: 'i' } }
//             ];
//         }

//         const user = req.user;
//         if (user.role === 'student') {
//             query.$or = [
//                 { allowedRoles: 'student' },
//                 { allowedRoles: { $size: 0 } }
//             ];

//             if (user.department) {
//                 query.$and = [
//                     {
//                         $or: [
//                             { allowedDepartments: user.department },
//                             { allowedDepartments: { $size: 0 } }
//                         ]
//                     },
//                     {
//                         $or: [
//                             { allowedYears: user.year },
//                             { allowedYears: { $size: 0 } }
//                         ]
//                     }
//                 ];
//             }
//         }

//         if (department) {
//             query.allowedDepartments = department;
//         }

//         const resources = await Resource.find(query)
//             .populate('faculty', 'name email')
//             .sort({ name: 1 });

//         res.json({ count: resources.length, resources });
//     } catch (error) {
//         console.error('Get resources error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ==================== GET SINGLE RESOURCE ====================
// router.get('/resources/:id', authenticate, async (req, res) => {
//     try {
//         const resource = await Resource.findById(req.params.id)
//             .populate('faculty', 'name email department');

//         if (!resource) {
//             return res.status(404).json({ error: 'Resource not found' });
//         }

//         const upcomingBookings = await Booking.find({
//             resource: resource._id,
//             status: { $in: ['confirmed', 'pending'] },
//             bookingDate: { $gte: new Date() }
//         })
//             .populate('user', 'name email')
//             .sort({ bookingDate: 1, startTime: 1 })
//             .limit(10);

//         res.json({ resource, upcomingBookings });
//     } catch (error) {
//         console.error('Get resource error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ==================== CREATE BOOKING (FIXED) ====================
// router.post('/bookings', authenticate, async (req, res) => {
//     try {
//         const { resourceId, bookingDate, startTime, endTime, purpose, quantity } = req.body;

//         // 1. Validate Inputs
//         if (!resourceId || !bookingDate || !startTime || !endTime) {
//             return res.status(400).json({ error: 'Missing required fields' });
//         }

//         const resource = await Resource.findById(resourceId);
//         if (!resource) {
//             return res.status(404).json({ error: 'Resource not found' });
//         }

//         if (resource.status !== 'available') {
//             return res.status(400).json({ error: 'Resource is not available' });
//         }

//         // 2. User Validation (from authenticate middleware)
//         const user = req.user;
//         if (!user) {
//             return res.status(401).json({ error: 'Authentication required' });
//         }

//         if (resource.allowedRoles.length > 0 && !resource.allowedRoles.includes(user.role)) {
//             return res.status(403).json({ error: 'You do not have permission to book this' });
//         }

//         if (user.role === 'student') {
//             if (user.activeBookings >= 3) {
//                 return res.status(400).json({ error: 'Maximum 3 active bookings allowed' });
//             }
//         }

//         // 3. Conflict Detection
//         const bookingQuantity = quantity || 1;
//         const conflict = await checkConflict(resourceId, bookingDate, startTime, endTime, bookingQuantity);
        
//         if (conflict.hasConflict) {
//             return res.status(409).json({ 
//                 error: 'Booking conflict detected', 
//                 details: conflict.reason 
//             });
//         }

//         // 4. Calculate Duration
//         const timeToMinutes = (time) => {
//             const [hours, minutes] = time.split(':').map(Number);
//             return hours * 60 + minutes;
//         };
//         const duration = timeToMinutes(endTime) - timeToMinutes(startTime);

//         if (duration <= 0) {
//             return res.status(400).json({ error: 'End time must be after start time' });
//         }

//         // 5. Initialize and Save Booking
//         const booking = new Booking({
//             bookingId: `BK-${Date.now()}`, // Generating required bookingId
//             user: user._id,               // Passing required user ID
//             resource: resourceId,
//             bookingDate: new Date(bookingDate),
//             startTime,
//             endTime,
//             duration,
//             purpose,
//             quantity: bookingQuantity,
//             status: 'confirmed'
//         });

//         await booking.save();

//         // 6. Update User and Resource Stats
//         user.activeBookings = (user.activeBookings || 0) + 1;
//         user.totalBookings = (user.totalBookings || 0) + 1;
//         await user.save();

//         resource.totalBookings += 1;
//         if (resource.type !== 'equipment' && resource.type !== 'book') {
//             resource.status = 'occupied';
//         }
//         await resource.save();

//         // 7. Post-booking actions
//         await booking.populate([
//             { path: 'user', select: 'name email role' },
//             { path: 'resource', select: 'name type location' }
//         ]);

//         sendBookingConfirmation(booking, user);
        
//         const notification = new Notification({
//             user: user._id,
//             type: 'booking_confirmed',
//             title: 'Booking Confirmed',
//             message: `Your booking for ${resource.name} has been confirmed`,
//             booking: booking._id
//         });
//         await notification.save();

//         res.status(201).json({ message: 'Booking created successfully', booking });

//     } catch (error) {
//         console.error('Create booking error:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

// // ==================== GET MY BOOKINGS ====================
// router.get('/my-bookings', authenticate, async (req, res) => {
//     try {
//         const { status, upcoming } = req.query;
//         const query = { user: req.user._id };

//         if (status) query.status = status;
//         if (upcoming === 'true') {
//             query.bookingDate = { $gte: new Date() };
//             query.status = { $in: ['confirmed', 'pending'] };
//         }

//         const bookings = await Booking.find(query)
//             .populate('resource')
//             .sort({ bookingDate: -1, startTime: -1 });

//         res.json({ count: bookings.length, bookings });
//     } catch (error) {
//         console.error('Get bookings error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ==================== CANCEL BOOKING ====================
// router.delete('/bookings/:id', authenticate, async (req, res) => {
//     try {
//         const booking = await Booking.findById(req.params.id).populate('resource').populate('user');

//         if (!booking) return res.status(404).json({ error: 'Booking not found' });

//         const isOwner = booking.user._id.toString() === req.user._id.toString();
//         const isAdmin = req.user.role === 'admin';

//         if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Access denied' });

//         booking.status = 'cancelled';
//         await booking.save();

//         if (booking.user.activeBookings > 0) {
//             booking.user.activeBookings -= 1;
//             await booking.user.save();
//         }

//         if (booking.resource.type !== 'equipment' && booking.resource.type !== 'book') {
//             booking.resource.status = 'available';
//             await booking.resource.save();
//         }

//         sendCancellationEmail(booking, booking.user);

//         const notification = new Notification({
//             user: booking.user._id,
//             type: 'booking_cancelled',
//             title: 'Booking Cancelled',
//             message: `Your booking for ${booking.resource.name} has been cancelled`,
//             booking: booking._id
//         });
//         await notification.save();

//         res.json({ message: 'Booking cancelled successfully', booking });
//     } catch (error) {
//         console.error('Cancel booking error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ==================== CHECK-IN ====================
// router.post('/bookings/:id/checkin', authenticate, async (req, res) => {
//     try {
//         const booking = await Booking.findById(req.params.id);
//         if (!booking) return res.status(404).json({ error: 'Booking not found' });

//         if (booking.user.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ error: 'Access denied' });
//         }

//         booking.checkedIn = true;
//         booking.checkInTime = new Date();
//         await booking.save();

//         res.json({ message: 'Checked in successfully', booking });
//     } catch (error) {
//         console.error('Check-in error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// // ==================== CALENDAR VIEW ====================
// router.get('/calendar', authenticate, async (req, res) => {
//     try {
//         const { start, end, resource } = req.query;
//         const query = {};

//         if (start && end) {
//             query.bookingDate = { $gte: new Date(start), $lte: new Date(end) };
//         }
//         if (resource) query.resource = resource;
//         query.status = { $in: ['confirmed', 'pending'] };

//         const bookings = await Booking.find(query)
//             .populate('user', 'name')
//             .populate('resource', 'name type location');

//         const events = bookings.map((booking) => ({
//             id: booking._id,
//             title: `${booking.resource.name} - ${booking.user.name}`,
//             start: `${booking.bookingDate.toISOString().split('T')[0]}T${booking.startTime}`,
//             end: `${booking.bookingDate.toISOString().split('T')[0]}T${booking.endTime}`,
//             resourceType: booking.resource.type,
//             location: booking.resource.location,
//             status: booking.status
//         }));

//         res.json({ events });
//     } catch (error) {
//         console.error('Calendar error:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const authenticate = require('../middleware/auth');

/* ======================================================
   CREATE BOOKING (Student / Faculty / Admin)
   POST /api/bookings
====================================================== */
router.post('/', authenticate, async (req, res) => {
  try {
    const { resourceId, bookingDate, startTime, endTime } = req.body;

    if (!resourceId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const booking = new Booking({
      user: req.user._id,
      resource: resourceId,
      bookingDate: new Date(bookingDate),
      startTime,
      endTime,
      status: 'confirmed'
    });

    await booking.save();

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   GET MY BOOKINGS (Any logged-in user)
   GET /api/bookings/my
====================================================== */
router.get('/my', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('resource', 'name type location')
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   ADMIN: GET ALL BOOKINGS
   GET /api/bookings
====================================================== */
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const bookings = await Booking.find()
      .populate('user', 'name email role')
      .populate('resource', 'name type location')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   CANCEL BOOKING
   DELETE /api/bookings/:id
====================================================== */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user')
      .populate('resource');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;



