// const express = require('express');
// const router = express.Router();

// // Import controller functions
// const { registerUser, loginUser, getMe } = require('../controllers/authController');

// // Import authentication middleware
// const authenticate = require('../middleware/auth');

// // Routes
// router.post('/register', registerUser);    // Register new user
// router.post('/login', loginUser);          // Login user
// router.get('/me', authenticate, getMe);    // Get current logged-in user

// module.exports = router;

// 

// routes/auth.js
// const express = require('express');

// const router = express.Router();

// const { registerUser, loginUser, getCurrentUser } = require('../controllers/authController');

// const authenticate = require('../middleware/auth');



// // ================= AUTH ROUTES =================



// // Register new user

// router.post('/register', registerUser);



// // Login existing user

// router.post('/login', loginUser);



// // Get current logged-in user (JWT protected)

// router.get('/me', authenticate, getCurrentUser);



// module.exports = router;

const express = require('express');
const router = express.Router();

// Import controllers
// NOTE: Ensure 'getMe' or 'getCurrentUser' matches your authController.js exactly
const { 
    registerUser, 
    loginUser, 
    getCurrentUser // If your controller uses 'getMe', change this to 'getMe'
} = require('../controllers/authController');

// Import middleware
// We fixed this to be 'module.exports = authenticate' in the previous step
const authenticate = require('../middleware/auth');

// ================= AUTH ROUTES =================

// Register new user
router.post('/register', registerUser);

// Login existing user
router.post('/login', loginUser);

// Get current logged-in user (JWT protected)
// This is a GET request, so make sure Postman is set to GET
router.get('/me', authenticate, getCurrentUser);

// This line is what Express looks for to avoid the "Router.use()" error
module.exports = router;