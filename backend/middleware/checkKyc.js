const KYC = require('../models/kycModel');

/**
 * Middleware to check if user has verified KYC
 * Only applies to farmer, landowner, and investor roles
 */
const checkKycVerified = async (req, res, next) => {
  try {
    // Only check KYC for these roles
    const kycRequiredRoles = ['farmer', 'landowner', 'investor'];
    
    if (!kycRequiredRoles.includes(req.user.role)) {
      return next(); // Skip KYC check for admin and vendor
    }

    // Check if user has KYC record
    const kycRecord = await KYC.findOne({ userId: req.user._id });

    if (!kycRecord) {
      return res.status(403).json({
        success: false,
        message: 'KYC verification required. Please complete your KYC to access this feature.',
        kycRequired: true,
        kycStatus: 'NOT_SUBMITTED'
      });
    }

    if (kycRecord.status === 'Pending') {
      return res.status(403).json({
        success: false,
        message: 'Your KYC is pending verification. Please wait for admin approval.',
        kycRequired: true,
        kycStatus: 'PENDING'
      });
    }

    if (kycRecord.status === 'Rejected') {
      return res.status(403).json({
        success: false,
        message: `Your KYC was rejected. Reason: ${kycRecord.rejectionReason || 'Not specified'}. Please resubmit with correct documents.`,
        kycRequired: true,
        kycStatus: 'REJECTED',
        rejectionReason: kycRecord.rejectionReason
      });
    }

    if (kycRecord.status !== 'Verified') {
      return res.status(403).json({
        success: false,
        message: 'KYC verification required to access this feature.',
        kycRequired: true,
        kycStatus: kycRecord.status
      });
    }

    // KYC is verified, proceed
    req.kycRecord = kycRecord;
    next();
  } catch (error) {
    console.error('Check KYC middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking KYC status',
      error: error.message
    });
  }
};

/**
 * Middleware to check KYC status and attach to request (doesn't block)
 */
const attachKycStatus = async (req, res, next) => {
  try {
    const kycRequiredRoles = ['farmer', 'landowner', 'investor'];
    
    if (!kycRequiredRoles.includes(req.user.role)) {
      req.kycStatus = 'NOT_REQUIRED';
      return next();
    }

    const kycRecord = await KYC.findOne({ userId: req.user._id });

    if (!kycRecord) {
      req.kycStatus = 'NOT_SUBMITTED';
      req.kycVerified = false;
    } else {
      req.kycStatus = kycRecord.status;
      req.kycVerified = kycRecord.status === 'Verified';
      req.kycRecord = kycRecord;
    }

    next();
  } catch (error) {
    console.error('Attach KYC status middleware error:', error);
    req.kycStatus = 'ERROR';
    req.kycVerified = false;
    next();
  }
};

module.exports = {
  checkKycVerified,
  attachKycStatus
};
