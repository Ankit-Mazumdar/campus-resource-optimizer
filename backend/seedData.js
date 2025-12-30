const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Resource = require('./models/Resource');
const Booking = require('./models/Booking');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Sample data seeding
const seedData = async () => {
  try {
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Resource.deleteMany({});
    await Booking.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // ==================== CREATE USERS ====================
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@college.edu',
      password: hashedPassword,
      role: 'admin',
      phone: '9876543210',
      department: 'Administration',
      activeBookings: 0,
      totalBookings: 0,
      missedBookings: 0
    });
    console.log('✅ Admin created:', admin.email);

    // Faculty
    const faculty1 = await User.create({
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@college.edu',
      password: hashedPassword,
      role: 'faculty',
      facultyId: 'FAC001',
      department: 'Computer Science',
      designation: 'Professor',
      phone: '9876543211',
      officeHours: [
        { day: 'Monday', startTime: '10:00', endTime: '12:00' },
        { day: 'Wednesday', startTime: '14:00', endTime: '16:00' }
      ],
      activeBookings: 0,
      totalBookings: 0,
      missedBookings: 0
    });
    console.log('✅ Faculty 1 created:', faculty1.email);

    const faculty2 = await User.create({
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@college.edu',
      password: hashedPassword,
      role: 'faculty',
      facultyId: 'FAC002',
      department: 'Electrical',
      designation: 'Associate Professor',
      phone: '9876543212',
      activeBookings: 0,
      totalBookings: 0,
      missedBookings: 0
    });
    console.log('✅ Faculty 2 created:', faculty2.email);

    // Students
    const student1 = await User.create({
      name: 'Rahul Verma',
      email: 'rahul.verma@student.college.edu',
      password: hashedPassword,
      role: 'student',
      rollNo: '21CS101',
      department: 'Computer Science',
      year: 3,
      phone: '9876543213',
      activeBookings: 0,
      totalBookings: 0,
      missedBookings: 0
    });
    console.log('✅ Student 1 created:', student1.email);

    const student2 = await User.create({
      name: 'Priya Singh',
      email: 'priya.singh@student.college.edu',
      password: hashedPassword,
      role: 'student',
      rollNo: '21EE105',
      department: 'Electrical',
      year: 2,
      phone: '9876543214',
      activeBookings: 0,
      totalBookings: 0,
      missedBookings: 0
    });
    console.log('✅ Student 2 created:', student2.email);

    const student3 = await User.create({
      name: 'Amit Patel',
      email: 'amit.patel@student.college.edu',
      password: hashedPassword,
      role: 'student',
      rollNo: '21ME110',
      department: 'Mechanical',
      year: 4,
      phone: '9876543215',
      activeBookings: 0,
      totalBookings: 0,
      missedBookings: 0
    });
    console.log('✅ Student 3 created:', student3.email);

    console.log('');

    // ==================== CREATE RESOURCES ====================
    console.log('🏫 Creating resources...');

    // Classrooms
    const classroom1 = await Resource.create({
      name: 'Classroom A-101',
      resourceId: 'CLA-101',
      type: 'classroom',
      description: 'Large classroom with projector and AC',
      location: 'Block A, 1st Floor',
      capacity: 60,
      allowedRoles: ['admin', 'faculty', 'student'],
      facilities: ['Projector', 'AC', 'Whiteboard', 'Sound System'],
      hasProjector: true,
      hasAC: true,
      hasWhiteboard: true,
      status: 'available',
      addedBy: admin._id
    });
    console.log('✅ Classroom 1 created');

    const seminarHall = await Resource.create({
      name: 'Seminar Hall B-201',
      resourceId: 'SEM-201',
      type: 'seminar_hall',
      description: 'Seminar hall for presentations',
      location: 'Block B, 2nd Floor',
      capacity: 100,
      allowedRoles: ['faculty'],
      allowedYears: [3, 4],
      facilities: ['Projector', 'AC', 'Podium', 'Microphone'],
      hasProjector: true,
      hasAC: true,
      status: 'available',
      addedBy: admin._id
    });
    console.log('✅ Seminar Hall created');

    // Labs
    const csLab = await Resource.create({
      name: 'Computer Lab 1',
      resourceId: 'LAB-CS-101',
      type: 'lab',
      description: 'Main computer lab with 40 systems',
      location: 'Block C, 2nd Floor',
      capacity: 40,
      allowedRoles: ['faculty', 'student'],
      allowedDepartments: ['Computer Science', 'Electronics'],
      allowedYears: [2, 3, 4],
      facilities: ['Computers', 'Projector', 'AC', 'High-speed Internet'],
      hasProjector: true,
      hasAC: true,
      hasComputers: true,
      computerCount: 40,
      status: 'available',
      addedBy: admin._id
    });
    console.log('✅ CS Lab created');

    const eeLab = await Resource.create({
      name: 'Electronics Lab',
      resourceId: 'LAB-EE-101',
      type: 'lab',
      description: 'Electronics and circuits lab',
      location: 'Block D, 1st Floor',
      capacity: 30,
      allowedRoles: ['faculty', 'student'],
      allowedDepartments: ['Electrical', 'Electronics'],
      allowedYears: [2, 3, 4],
      facilities: ['Oscilloscopes', 'Multimeters', 'Power Supply', 'Workbenches'],
      status: 'available',
      addedBy: admin._id
    });
    console.log('✅ EE Lab created');

    // Equipment
    const projector = await Resource.create({
      name: 'Portable Projector 1',
      resourceId: 'EQP-PROJ-001',
      type: 'equipment',
      description: 'HD portable projector with HDMI',
      location: 'Equipment Room, Block A',
      quantity: 3,
      availableQuantity: 3,
      allowedRoles: ['faculty', 'student'],
      status: 'available',
      addedBy: admin._id
    });
    console.log('✅ Projector equipment created');

    const laptop = await Resource.create({
      name: 'MacBook Pro (Programming)',
      resourceId: 'EQP-LAP-001',
      type: 'equipment',
      description: 'High-performance laptop for development',
      location: 'Equipment Room, Block C',
      quantity: 5,
      availableQuantity: 5,
      allowedRoles: ['student'],
      allowedDepartments: ['Computer Science'],
      allowedYears: [3, 4],
      status: 'available',
      addedBy: admin._id
    });
    console.log('✅ Laptop equipment created');

    // Books
    const book1 = await Resource.create({
      name: 'Introduction to Algorithms (CLRS)',
      resourceId: 'BOOK-CS-001',
      type: 'book',
      description: 'Classic algorithms textbook',
      author: 'Cormen, Leiserson, Rivest, Stein',
      isbn: '978-0262033848',
      category: 'Computer Science',
      location: 'Library, Section CS',
      quantity: 10,
      availableQuantity: 10,
      allowedRoles: ['faculty', 'student'],
      status: 'available',
      addedBy: admin._id
    });
    console.log('✅ Book 1 created');

    const book2 = await Resource.create({
      name: 'Design Patterns',
      resourceId: 'BOOK-CS-002',
      type: 'book',
      description: 'Gang of Four design patterns',
      author: 'Gamma, Helm, Johnson, Vlissides',
      isbn: '978-0201633610',
      category: 'Software Engineering',
      location: 'Library, Section CS',
      quantity: 5,
      availableQuantity: 5,
      allowedRoles: ['faculty', 'student'],
      allowedDepartments: ['Computer Science'],
      allowedYears: [3, 4],
      status: 'available',
      addedBy: admin._id
    });
    console.log('✅ Book 2 created');

    // Faculty hours
    const facultyHours = await Resource.create({
      name: 'Dr. Rajesh Kumar - Office Hours',
      resourceId: 'FAC-HOURS-001',
      type: 'faculty_hours',
      description: 'One-on-one consultation',
      location: 'Room 305, Faculty Block',
      capacity: 1,
      faculty: faculty1._id,
      allowedRoles: ['student'],
      allowedDepartments: ['Computer Science'],
      status: 'available',
      addedBy: admin._id
    });
    console.log('✅ Faculty hours created');

    console.log('\n📅 Creating sample bookings...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Booking 1
    const booking1 = await Booking.create({
      user: student1._id,
      resource: csLab._id,
      bookingDate: tomorrow,
      startTime: '10:00',
      endTime: '12:00',
      duration: 120,
      purpose: 'Mini project work',
      status: 'confirmed'
    });
    student1.activeBookings += 1;
    student1.totalBookings += 1;
    await student1.save();
    console.log('✅ Booking 1 created');

    // Booking 2
    const booking2 = await Booking.create({
      user: faculty1._id,
      resource: classroom1._id,
      bookingDate: tomorrow,
      startTime: '14:00',
      endTime: '16:00',
      duration: 120,
      purpose: 'Guest lecture',
      status: 'confirmed'
    });
    faculty1.activeBookings += 1;
    faculty1.totalBookings += 1;
    await faculty1.save();
    console.log('✅ Booking 2 created');

    // Booking 3 (book)
    const booking3 = await Booking.create({
      user: student2._id,
      resource: book1._id,
      bookingDate: tomorrow,
      startTime: '09:00',
      endTime: '17:00',
      duration: 480,
      quantity: 1,
      purpose: 'Exam preparation',
      status: 'confirmed'
    });
    student2.activeBookings += 1;
    student2.totalBookings += 1;
    await student2.save();
    book1.availableQuantity -= 1;
    await book1.save();
    console.log('✅ Booking 3 created');

    console.log('\n================================================');
    console.log('✅ Database seeded successfully!');
    console.log('================================================\n');
    console.log('📊 Summary:');
    console.log(`   Users: ${await User.countDocuments()}`);
    console.log(`   Resources: ${await Resource.countDocuments()}`);
    console.log(`   Bookings: ${await Booking.countDocuments()}\n`);
    console.log('🔐 Test Credentials:');
    console.log('   Admin: admin@college.edu / password123');
    console.log('   Faculty: rajesh.kumar@college.edu / password123');
    console.log('   Student: rahul.verma@student.college.edu / password123\n');
    console.log('================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
