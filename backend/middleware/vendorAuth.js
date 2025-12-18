const jwt = require('jsonwebtoken');
const Vendor = require('../models/Vendor');

/**
 * Vendor Authentication Middleware
 * Verifies JWT token and attaches vendor to req.vendor
 */
async function vendorAuth(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'No token, authorization denied' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify vendor exists
    const vendor = await Vendor.findById(decoded.id);
    if (!vendor) {
      return res.status(401).json({ 
        success: false,
        message: 'Vendor not found' 
      });
    }

    // Verify role is vendor
    if (decoded.role !== 'vendor') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied: vendor role required' 
      });
    }

    req.vendor = vendor; // Attach vendor to request
    req.vendorId = vendor._id; // Also attach vendorId for convenience
    next();
  } catch (err) {
    console.error('Vendor auth error:', err);
    return res.status(401).json({ 
      success: false,
      message: 'Token is invalid' 
    });
  }
}

module.exports = vendorAuth;

