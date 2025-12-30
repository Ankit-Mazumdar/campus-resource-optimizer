// const mongoose = require('mongoose');

// const resourceSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   resourceId: { type: String, required: true, unique: true },
//   type: {
//     type: String,
//     required: true,
//     enum: ['classroom', 'lab', 'equipment', 'book', 'faculty_hours', 'seminar_hall', 'auditorium']
//   },
//   description: String,
//   location: String,
//   capacity: { type: Number, default: 1, min: 1 },
//   quantity: { type: Number, default: 1, min: 0 },
//   availableQuantity: { type: Number, default: 1, min: 0 },
//   author: String,
//   isbn: String,
//   category: String,
//   faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   allowedRoles: [{ type: String, enum: ['admin', 'faculty', 'student'] }],
//   allowedDepartments: [String],
//   allowedYears: [Number],
//   facilities: [String],
//   hasProjector: { type: Boolean, default: false },
//   hasAC: { type: Boolean, default: false },
//   hasWhiteboard: { type: Boolean, default: false },
//   hasComputers: { type: Boolean, default: false },
//   computerCount: { type: Number, min: 0 },
//   status: { type: String, enum: ['available', 'maintenance', 'occupied', 'retired'], default: 'available' },
//   addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   totalBookings: { type: Number, default: 0 },
//   utilizationRate: { type: Number, default: 0 },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now }
// });

// resourceSchema.index({ resourceId: 1 }, { unique: true });

// resourceSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// module.exports = mongoose.model('Resource', resourceSchema);

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  resourceId: { type: String, required: true, unique: true },
  type: {
    type: String,
    required: true,
    enum: ['classroom', 'lab', 'equipment', 'book', 'faculty_hours', 'seminar_hall', 'auditorium']
  },
  description: String,
  location: String,
  capacity: { type: Number, default: 1, min: 1 },
  quantity: { type: Number, default: 1, min: 0 },
  availableQuantity: { type: Number, default: 1, min: 0 },
  author: String,
  isbn: String,
  category: String,
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  allowedRoles: [{ type: String, enum: ['admin', 'faculty', 'student'] }],
  allowedDepartments: [String],
  allowedYears: [Number],
  facilities: [String],
  hasProjector: { type: Boolean, default: false },
  hasAC: { type: Boolean, default: false },
  hasWhiteboard: { type: Boolean, default: false },
  hasComputers: { type: Boolean, default: false },
  computerCount: { type: Number, min: 0 },
  status: { type: String, enum: ['available', 'maintenance', 'occupied', 'retired'], default: 'available' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalBookings: { type: Number, default: 0 },
  utilizationRate: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

resourceSchema.index({ resourceId: 1 }, { unique: true });

resourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports =
  mongoose.models.Resource ||
  mongoose.model('Resource', resourceSchema);

