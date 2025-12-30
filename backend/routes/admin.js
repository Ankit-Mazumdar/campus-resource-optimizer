const express = require('express');
const Resource = require('../models/Resource');
const User = require('../models/User');
const Booking = require('../models/Booking');
const authenticate = require('../middleware/auth');
const checkRole = require('../middleware/roleCheck');

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(checkRole('admin'));

// ==================== RESOURCE MANAGEMENT ====================

// CREATE RESOURCE
router.post('/resources', async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      location,
      capacity,
      quantity,
      allowedRoles,
      allowedDepartments,
      allowedYears,
      facilities,
      ...otherFields
    } = req.body;

    // Generate unique resource ID
    const resourceId = type.toUpperCase().substring(0, 3) + '-' + Date.now();

    const resource = new Resource({
      name,
      resourceId,
      type,
      description,
      location,
      capacity,
      quantity: quantity || 1,
      availableQuantity: quantity || 1,
      allowedRoles: allowedRoles || [],
      allowedDepartments: allowedDepartments || [],
      allowedYears: allowedYears || [],
      facilities: facilities || [],
      status: 'available', // default status
      addedBy: req.user._id,
      ...otherFields
    });

    await resource.save();

    res.status(201).json({
      message: 'Resource created successfully',
      resource
    });

  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE RESOURCE
router.put('/resources/:id', async (req, res) => {
  try {
    const updates = req.body;
    delete updates.resourceId; // Don't allow ID change
    delete updates.addedBy; // Don't allow creator change

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({
      message: 'Resource updated successfully',
      resource
    });

  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE RESOURCE (Soft delete - retire)
router.delete('/resources/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check if resource has active bookings
    const activeBookings = await Booking.countDocuments({
      resource: resource._id,
      status: { $in: ['confirmed', 'pending'] },
      bookingDate: { $gte: new Date() }
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        error: 'Cannot delete resource with active bookings',
        activeBookings
      });
    }

    resource.status = 'retired';
    await resource.save();

    res.json({
      message: 'Resource retired successfully',
      resource
    });

  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// BULK UPLOAD RESOURCES
router.post('/resources/bulk', async (req, res) => {
  try {
    const { resources } = req.body;

    if (!Array.isArray(resources) || resources.length === 0) {
      return res.status(400).json({ error: 'Invalid resources array' });
    }

    const createdResources = [];
    const errors = [];

    for (let i = 0; i < resources.length; i++) {
      try {
        const resourceData = resources[i];
        const resourceId = resourceData.type.toUpperCase().substring(0, 3) + '-' + Date.now() + '-' + i;

        const resource = new Resource({
          ...resourceData,
          resourceId,
          availableQuantity: resourceData.quantity || 1,
          status: 'available',
          addedBy: req.user._id
        });

        await resource.save();
        createdResources.push(resource);

      } catch (error) {
        errors.push({
          index: i,
          resource: resources[i],
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: `Created ${createdResources.length} resources`,
      created: createdResources.length,
      failed: errors.length,
      resources: createdResources,
      errors
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== USER MANAGEMENT ====================

// GET ALL USERS
router.get('/users', async (req, res) => {
  try {
    const { role, department, search, page = 1, limit = 50 } = req.query;
    
    const query = {};
    
    if (role) query.role = role;
    if (department) query.department = department;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
        { facultyId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE USER
router.put('/users/:id', async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Prevent password change via this route

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// TOGGLE USER STATUS
router.patch('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// APPLY/REMOVE PENALTY
router.patch('/users/:id/penalty', async (req, res) => {
  try {
    const { penaltyStatus } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.penaltyStatus = penaltyStatus;
    await user.save();

    res.json({
      message: `Penalty ${penaltyStatus ? 'applied' : 'removed'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        penaltyStatus: user.penaltyStatus
      }
    });

  } catch (error) {
    console.error('Penalty error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== BOOKING MANAGEMENT ====================

// APPROVE/REJECT BOOKING
router.patch('/bookings/:id/approve', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('user')
      .populate('resource');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = status;
    booking.approvedBy = req.user._id;
    booking.approvalDate = new Date();

    if (status === 'rejected') {
      booking.rejectionReason = rejectionReason;
      if (booking.user.activeBookings > 0) {
        booking.user.activeBookings -= 1;
        await booking.user.save();
      }
    }

    await booking.save();

    res.json({
      message: `Booking ${status} successfully`,
      booking
    });

  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// MARK BOOKING AS MISSED
router.patch('/bookings/:id/mark-missed', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user')
      .populate('resource');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = 'missed';
    await booking.save();

    booking.user.missedBookings += 1;
    if (booking.user.activeBookings > 0) {
      booking.user.activeBookings -= 1;
    }

    if (booking.user.missedBookings >= 3) {
      booking.user.penaltyStatus = true;
    }

    await booking.user.save();

    if (booking.resource.type !== 'equipment' && booking.resource.type !== 'book') {
      booking.resource.status = 'available';
      await booking.resource.save();
    }

    res.json({
      message: 'Booking marked as missed',
      booking,
      penaltyApplied: booking.user.penaltyStatus
    });

  } catch (error) {
    console.error('Mark missed error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== DASHBOARD STATS ====================
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalFaculty,
      totalResources,
      activeBookings,
      todayBookings,
      totalBookings
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      Resource.countDocuments({ status: { $ne: 'retired' } }),
      Booking.countDocuments({ 
        status: 'confirmed',
        bookingDate: { $gte: new Date() }
      }),
      Booking.countDocuments({
        bookingDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      Booking.countDocuments()
    ]);

    const resourceTypes = await Resource.aggregate([
      { $match: { status: { $ne: 'retired' } } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const recentBookings = await Booking.find()
      .populate('user', 'name email role')
      .populate('resource', 'name type')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalResources,
        activeBookings,
        todayBookings,
        totalBookings
      },
      resourceTypes,
      recentBookings
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== SYSTEM HEALTH ====================
router.get('/system-health', async (req, res) => {
  try {
    const [
      pendingApprovals,
      overdueBookings,
      maintenanceResources,
      penalizedUsers
    ] = await Promise.all([
      Booking.countDocuments({ status: 'pending', requiresApproval: true }),
      Booking.countDocuments({ status: 'confirmed', bookingDate: { $lt: new Date() }, checkedOut: false }),
      Resource.countDocuments({ status: 'maintenance' }),
      User.countDocuments({ penaltyStatus: true })
    ]);

    res.json({
      health: {
        pendingApprovals,
        overdueBookings,
        maintenanceResources,
        penalizedUsers
      },
      status: 'healthy'
    });

  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
