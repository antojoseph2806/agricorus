const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function auth(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // contains { id, role }
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ msg: 'User not found' });

    req.user = user; // now req.user._id exists
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ msg: 'Token is invalid' });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
}

module.exports = auth;
module.exports.auth = auth;
module.exports.requireRole = requireRole;
