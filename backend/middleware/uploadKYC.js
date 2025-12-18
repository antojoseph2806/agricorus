const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const kycDirs = {
  pan: path.join(__dirname, '../uploads/kyc/pan'),
  aadhar: path.join(__dirname, '../uploads/kyc/aadhar'),
  bank: path.join(__dirname, '../uploads/kyc/bank'),
  gst: path.join(__dirname, '../uploads/kyc/gst'),
  businessLicense: path.join(__dirname, '../uploads/kyc/business-license')
};

Object.values(kycDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Combined storage that routes files based on field name
const combinedStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    
    switch (file.fieldname) {
      case 'panCard':
        uploadPath = kycDirs.pan;
        break;
      case 'aadharCard':
        uploadPath = kycDirs.aadhar;
        break;
      case 'bankProof':
        uploadPath = kycDirs.bank;
        break;
      case 'gstCertificate':
        uploadPath = kycDirs.gst;
        break;
      case 'businessLicense':
        uploadPath = kycDirs.businessLicense;
        break;
      default:
        return cb(new Error('Invalid field name'), null);
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const fieldName = file.fieldname;
    cb(null, `${fieldName}-${uniqueSuffix}${ext}`);
  }
});

// File filter for KYC documents (PDF and images)
const kycFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, JPG, PNG, and WEBP are allowed.'), false);
  }
};

// Combined multer for handling all KYC documents in one request
const uploadKYCDocuments = multer({
  storage: combinedStorage,
  fileFilter: kycFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  }
}).fields([
  { name: 'panCard', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
  { name: 'bankProof', maxCount: 1 },
  { name: 'gstCertificate', maxCount: 1 },
  { name: 'businessLicense', maxCount: 1 }
]);

module.exports = {
  uploadKYCDocuments
};

