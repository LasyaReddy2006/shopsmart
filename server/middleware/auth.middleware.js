// auth.middleware.js
// This middleware runs BEFORE protected route handlers.
// It checks the JWT token sent by the frontend.

const jwt = require('jsonwebtoken');

// Verify that the request has a valid JWT token
function authenticateToken(req, res, next) {
  // The frontend sends the token in the Authorization header like:
  // Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token part

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // jwt.verify checks the token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to the request object
    next();             // Continue to the actual route handler
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

// This middleware checks if the logged-in user is an admin
// IMPORTANT: We check the role from the JWT (set by the server at login),
// NOT from anything the frontend sends. This prevents users from faking admin access.
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin };
