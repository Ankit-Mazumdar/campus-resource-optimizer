// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true,
//     match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
//   },
//   password: { type: String, required: true, select: false },
//   role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },

//   // Common fields
//   phone: String,
//   department: String,

//   // Student-specific
//   rollNo: {
//     type: String,
//     sparse: true,
//     unique: true,
//     required: function() { return this.role === 'student'; }
//   },
//   year: { type: Number, min: 1, max: 4 },

//   // Faculty-specific
//   facultyId: {
//     type: String,
//     sparse: true,
//     unique: true,
//     required: function() { return this.role === 'faculty'; }
//   },
//   designation: String,
//   officeHours: [{ day: String, startTime: String, endTime: String }],

//   // Booking stats
//   activeBookings: { type: Number, default: 0 },
//   totalBookings: { type: Number, default: 0 },
//   missedBookings: { type: Number, default: 0 },

//   // Account status
//   isActive: { type: Boolean, default: true },
//   penaltyStatus: { type: Boolean, default: false },

//   createdAt: { type: Date, default: Date.now }
// });

// // Indexes
// userSchema.index({ rollNo: 1 }, { unique: true, sparse: true });
// userSchema.index({ facultyId: 1 }, { unique: true, sparse: true });

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // Compare password
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Automatically converts to lower case
    trim: true,      // Removes accidental spaces
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'faculty', 'student'], required: true },
  rollNo: {
    type: String,
    sparse: true,
    unique: true,
    required: function() { return this.role === 'student'; }
  },
  // ... other fields (phone, department, etc. remain the same)
}, { timestamps: true });

// ================= PASSWORD HASHING =================
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ================= PASSWORD COMPARISON =================
userSchema.methods.comparePassword = async function(candidatePassword) {
  // 'this.password' is available here because we use .select('+password') in the controller
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);