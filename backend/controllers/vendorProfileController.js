const VendorProfile = require('../models/VendorProfile');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

/**
 * Helper function to format API response
 */
const sendResponse = (res, success, message, data = null, statusCode = 200) => {
  res.status(statusCode).json({
    success,
    message,
    data
  });
};

/**
 * Helper function to validate ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Helper function to delete files
 */
const deleteFiles = (filePaths) => {
  if (!filePaths) return;
  const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
  paths.forEach(filePath => {
    if (filePath) {
      const fullPath = path.join(__dirname, '..', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  });
};

/**
 * @route   GET /api/vendor/profile
 * @desc    Get vendor profile & KYC status
 * @access  Private (Vendor only)
 */
exports.getVendorProfile = async (req, res) => {
  try {
    const vendorId = req.vendorId;

    const profile = await VendorProfile.findOne({ vendorId });

    if (!profile) {
      return sendResponse(res, true, 'Profile not found', null, 200);
    }

    sendResponse(res, true, 'Profile retrieved successfully', profile);
  } catch (error) {
    console.error('Get vendor profile error:', error);
    sendResponse(res, false, 'Error retrieving profile', null, 500);
  }
};

/**
 * @route   GET /api/vendor/profile/status
 * @desc    Get lightweight KYC status check
 * @access  Private (Vendor only)
 */
exports.getKYCStatus = async (req, res) => {
  try {
    const vendorId = req.vendorId;

    const profile = await VendorProfile.findOne({ vendorId }).select('kycStatus rejectionReason');

    if (!profile) {
      return sendResponse(res, true, 'Profile not found', { 
        kycStatus: 'PENDING',
        hasProfile: false 
      });
    }

    sendResponse(res, true, 'KYC status retrieved successfully', {
      kycStatus: profile.kycStatus,
      rejectionReason: profile.rejectionReason,
      hasProfile: true
    });
  } catch (error) {
    console.error('Get KYC status error:', error);
    sendResponse(res, false, 'Error retrieving KYC status', null, 500);
  }
};

/**
 * @route   POST /api/vendor/profile
 * @desc    Create profile & submit KYC
 * @access  Private (Vendor only)
 */
exports.createVendorProfile = async (req, res) => {
  try {
    const vendorId = req.vendorId;

    // Check if profile already exists
    const existingProfile = await VendorProfile.findOne({ vendorId });
    if (existingProfile) {
      return sendResponse(res, false, 'Profile already exists. Use PUT to update.', null, 400);
    }

    const {
      businessName,
      ownerName,
      phone,
      email,
      address,
      businessType,
      establishedYear,
      gstin,
      panNumber,
      aadharNumber,
      bankDetails
    } = req.body;

    // Validate required fields
    if (!businessName || !ownerName || !phone || !email || !address || !businessType || !panNumber || !bankDetails) {
      return sendResponse(res, false, 'Missing required fields', null, 400);
    }

    // Validate address object
    if (!address.street || !address.district || !address.state || !address.pincode) {
      return sendResponse(res, false, 'Complete address is required', null, 400);
    }

    // Validate bank details
    if (!bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName) {
      return sendResponse(res, false, 'Complete bank details are required', null, 400);
    }

    // Handle document uploads
    const documents = {};
    if (req.files) {
      if (req.files.panCard && req.files.panCard[0]) {
        documents.panCard = `/uploads/kyc/pan/${req.files.panCard[0].filename}`;
      }
      if (req.files.aadharCard && req.files.aadharCard[0]) {
        documents.aadharCard = `/uploads/kyc/aadhar/${req.files.aadharCard[0].filename}`;
      }
      if (req.files.bankProof && req.files.bankProof[0]) {
        documents.bankProof = `/uploads/kyc/bank/${req.files.bankProof[0].filename}`;
      }
      if (req.files.gstCertificate && req.files.gstCertificate[0]) {
        documents.gstCertificate = `/uploads/kyc/gst/${req.files.gstCertificate[0].filename}`;
      }
      if (req.files.businessLicense && req.files.businessLicense[0]) {
        documents.businessLicense = `/uploads/kyc/business-license/${req.files.businessLicense[0].filename}`;
      }
    }

    // Validate required documents
    if (!documents.panCard || !documents.bankProof) {
      // Clean up uploaded files if validation fails
      Object.values(documents).forEach(filePath => {
        if (filePath) deleteFiles(filePath);
      });
      return sendResponse(res, false, 'PAN card and Bank proof documents are required', null, 400);
    }

    // Create profile
    const profile = await VendorProfile.create({
      vendorId,
      businessName,
      ownerName,
      phone,
      email,
      address: {
        street: address.street,
        district: address.district,
        state: address.state,
        pincode: address.pincode
      },
      businessType,
      establishedYear: establishedYear ? parseInt(establishedYear) : undefined,
      gstin: gstin || undefined,
      panNumber: panNumber.toUpperCase(),
      aadharNumber: aadharNumber || undefined,
      bankDetails: {
        accountHolderName: bankDetails.accountHolderName,
        accountNumber: bankDetails.accountNumber,
        ifscCode: bankDetails.ifscCode.toUpperCase(),
        bankName: bankDetails.bankName
      },
      panCard: documents.panCard,
      aadharCard: documents.aadharCard,
      bankProof: documents.bankProof,
      gstCertificate: documents.gstCertificate,
      businessLicense: documents.businessLicense,
      kycStatus: 'SUBMITTED',
      submittedAt: new Date()
    });

    sendResponse(res, true, 'Profile created and KYC submitted successfully', profile, 201);
  } catch (error) {
    console.error('Create vendor profile error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach(file => {
            const filePath = path.join(__dirname, '../uploads/kyc', file.fieldname, file.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          });
        }
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return sendResponse(res, false, errors.join(', '), null, 400);
    }

    sendResponse(res, false, error.message || 'Error creating profile', null, 500);
  }
};

/**
 * @route   PUT /api/vendor/profile
 * @desc    Update profile (only if NOT VERIFIED)
 * @access  Private (Vendor only)
 */
exports.updateVendorProfile = async (req, res) => {
  try {
    const vendorId = req.vendorId;

    // Find profile
    const profile = await VendorProfile.findOne({ vendorId });
    if (!profile) {
      return sendResponse(res, false, 'Profile not found. Please create profile first.', null, 404);
    }

    // Business rule: VERIFIED profile cannot be edited
    if (profile.kycStatus === 'VERIFIED') {
      return sendResponse(res, false, 'Verified profile cannot be edited. Contact admin for changes.', null, 403);
    }

    const {
      businessName,
      ownerName,
      phone,
      email,
      address,
      businessType,
      establishedYear,
      gstin,
      panNumber,
      aadharNumber,
      bankDetails
    } = req.body;

    // Update fields if provided
    if (businessName !== undefined) profile.businessName = businessName;
    if (ownerName !== undefined) profile.ownerName = ownerName;
    if (phone !== undefined) profile.phone = phone;
    if (email !== undefined) profile.email = email;
    if (businessType !== undefined) profile.businessType = businessType;
    if (establishedYear !== undefined) profile.establishedYear = parseInt(establishedYear);
    if (gstin !== undefined) profile.gstin = gstin || undefined;
    if (panNumber !== undefined) profile.panNumber = panNumber.toUpperCase();
    if (aadharNumber !== undefined) profile.aadharNumber = aadharNumber || undefined;

    // Update address if provided
    if (address) {
      if (address.street !== undefined) profile.address.street = address.street;
      if (address.district !== undefined) profile.address.district = address.district;
      if (address.state !== undefined) profile.address.state = address.state;
      if (address.pincode !== undefined) profile.address.pincode = address.pincode;
    }

    // Update bank details if provided
    if (bankDetails) {
      if (bankDetails.accountHolderName !== undefined) profile.bankDetails.accountHolderName = bankDetails.accountHolderName;
      if (bankDetails.accountNumber !== undefined) profile.bankDetails.accountNumber = bankDetails.accountNumber;
      if (bankDetails.ifscCode !== undefined) profile.bankDetails.ifscCode = bankDetails.ifscCode.toUpperCase();
      if (bankDetails.bankName !== undefined) profile.bankDetails.bankName = bankDetails.bankName;
    }

    // Handle document uploads
    if (req.files) {
      // Delete old files and update with new ones
      if (req.files.panCard && req.files.panCard[0]) {
        if (profile.panCard) deleteFiles(profile.panCard);
        profile.panCard = `/uploads/kyc/pan/${req.files.panCard[0].filename}`;
      }
      if (req.files.aadharCard && req.files.aadharCard[0]) {
        if (profile.aadharCard) deleteFiles(profile.aadharCard);
        profile.aadharCard = `/uploads/kyc/aadhar/${req.files.aadharCard[0].filename}`;
      }
      if (req.files.bankProof && req.files.bankProof[0]) {
        if (profile.bankProof) deleteFiles(profile.bankProof);
        profile.bankProof = `/uploads/kyc/bank/${req.files.bankProof[0].filename}`;
      }
      if (req.files.gstCertificate && req.files.gstCertificate[0]) {
        if (profile.gstCertificate) deleteFiles(profile.gstCertificate);
        profile.gstCertificate = `/uploads/kyc/gst/${req.files.gstCertificate[0].filename}`;
      }
      if (req.files.businessLicense && req.files.businessLicense[0]) {
        if (profile.businessLicense) deleteFiles(profile.businessLicense);
        profile.businessLicense = `/uploads/kyc/business-license/${req.files.businessLicense[0].filename}`;
      }
    }

    // Validate required documents still exist
    if (!profile.panCard || !profile.bankProof) {
      return sendResponse(res, false, 'PAN card and Bank proof documents are required', null, 400);
    }

    // If updating and status is PENDING or REJECTED, set to SUBMITTED
    if (profile.kycStatus === 'PENDING' || profile.kycStatus === 'REJECTED') {
      profile.kycStatus = 'SUBMITTED';
      profile.submittedAt = new Date();
      profile.rejectionReason = undefined; // Clear rejection reason on resubmission
    }

    const updatedProfile = await profile.save();
    sendResponse(res, true, 'Profile updated successfully', updatedProfile);
  } catch (error) {
    console.error('Update vendor profile error:', error);

    // Clean up uploaded files on error
    if (req.files) {
      Object.values(req.files).forEach(fileArray => {
        if (Array.isArray(fileArray)) {
          fileArray.forEach(file => {
            const filePath = path.join(__dirname, '../uploads/kyc', file.fieldname, file.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          });
        }
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return sendResponse(res, false, errors.join(', '), null, 400);
    }

    sendResponse(res, false, error.message || 'Error updating profile', null, 500);
  }
};

