// // middleware/auth.js
// const jwt = require('jsonwebtoken');

// const authenticate = (req, res, next) => {
//   try {
//     // Get token from Authorization header
//     const authHeader = req.header('Authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ error: 'No token, authorization denied' });
//     }

//     const token = authHeader.replace('Bearer ', '');

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Attach user info to request
//     req.user = { id: decoded.id, role: decoded.role };

//     next();
//   } catch (err) {
//     console.error('Auth Middleware Error:', err.message);
//     res.status(401).json({ error: 'Token is not valid' });
//   }
// };

// module.exports = authenticate;

// middleware/auth.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const authenticate = async (req, res, next) => {
//   try {
//     // Get token from Authorization header
//     const authHeader = req.header('Authorization');

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ error: 'No token, authorization denied' });
//     }

//     const token = authHeader.replace('Bearer ', '');

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // 🔥 IMPORTANT: Fetch full user from DB
//     const user = await User.findById(decoded.id);

//     if (!user) {
//       return res.status(401).json({ error: 'User not found' });
//     }

//     // Attach FULL user document
//     req.user = user;

//     next();
//   } catch (err) {
//     console.error('Auth Middleware Error:', err.message);
//     res.status(401).json({ error: 'Token is not valid' });
//   }
// };

// module.exports = authenticate;


const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch full user from DB and attach to req.user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // This makes 'req.user' available in your booking route
    req.user = user;

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err.message);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// This is the correct way to export it to avoid the "Router.use() requires a middleware function" error
module.exports = authenticate;

