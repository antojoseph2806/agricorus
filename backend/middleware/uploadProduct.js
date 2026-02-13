const multer = require('multer');
const {
  productImageStorage,
  safetyDocumentStorage,
  combinedStorage,
  imageFilter,
  pdfFilter,
  combinedFilter
} = require('../config/cloudinary');

// Multer instances using Cloudinary storage
const uploadProductImages = multer({
  storage: productImageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per image
  }
});

const uploadSafetyDocuments = multer({
  storage: safetyDocumentStorage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per document
  }
});

// Combined multer for handling both images and documents in one request
const uploadProductFiles = multer({
  storage: combinedStorage,
  fileFilter: combinedFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  }
}).fields([
  { name: 'images', maxCount: 5 },
  { name: 'safetyDocuments', maxCount: 10 }
]);

module.exports = {
  uploadProductImages,
  uploadSafetyDocuments,
  uploadProductFiles
};

