// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// // ================= REGISTER =================
// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password, role, rollNo } = req.body;

//     if (!name || !email || !password || !role || !rollNo) {
//       return res.status(400).json({ error: 'Please provide all required fields' });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ error: 'User already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       role,
//       rollNo
//     });

//     res.status(201).json({
//       message: 'User registered successfully',
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         rollNo: user.rollNo
//       }
//     });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // ================= LOGIN =================
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ error: 'Please provide email and password' });
//     }

//     // 🔥 IMPORTANT FIX HERE
//     // const user = await User.findOne({ email }).select('+password');
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: 'Invalid credentials' });
//     }

//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: '1d' }
//     );

//     res.json({
//       message: 'Login successful',
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         rollNo: user.rollNo
//       }
//     });

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = { registerUser, loginUser };



const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ================= REGISTER =================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, rollNo } = req.body;

    if (!name || !email || !password || !role || !rollNo) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Creating user (Schema's .pre('save') hashes the password)
    const user = await User.create({ name, email, password, role, rollNo });

    res.status(201).json({
      message: 'User registered successfully',
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= LOGIN =================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    // 1. Find user and explicitly include password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    if (!user) {
      console.log("Debug: Email not found in database");
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 2. Use the schema method to compare
    const isMatch = await user.comparePassword(password);
    console.log("Debug: Password match result ->", isMatch);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // 3. Generate Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// ================= GET CURRENT USER =================
const getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const userId = req.user.id;

    // Find user and exclude password
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Get Current User Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { registerUser, loginUser, getCurrentUser };
