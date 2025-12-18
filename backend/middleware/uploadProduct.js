const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const productImagesDir = path.join(__dirname, '../uploads/products/images');
const safetyDocsDir = path.join(__dirname, '../uploads/products/safety-docs');

[productImagesDir, safetyDocsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for product images
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, productImagesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `product-image-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Storage configuration for safety documents
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, safetyDocsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `safety-doc-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Only JPG, PNG, and WEBP are allowed.'), false);
  }
};

// File filter for PDF documents
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid document format. Only PDF files are allowed.'), false);
  }
};

// Combined storage that routes files based on field name
const combinedStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'images') {
      cb(null, productImagesDir);
    } else if (file.fieldname === 'safetyDocuments') {
      cb(null, safetyDocsDir);
    } else {
      cb(new Error('Invalid field name'), null);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    if (file.fieldname === 'images') {
      cb(null, `product-image-${uniqueSuffix}${path.extname(file.originalname)}`);
    } else if (file.fieldname === 'safetyDocuments') {
      cb(null, `safety-doc-${uniqueSuffix}${path.extname(file.originalname)}`);
    } else {
      cb(new Error('Invalid field name'), null);
    }
  }
});

// Combined file filter
const combinedFilter = (req, file, cb) => {
  if (file.fieldname === 'images') {
    imageFilter(req, file, cb);
  } else if (file.fieldname === 'safetyDocuments') {
    pdfFilter(req, file, cb);
  } else {
    cb(new Error('Invalid field name'), false);
  }
};

// Multer instances
const uploadProductImages = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per image
  }
});

const uploadSafetyDocuments = multer({
  storage: documentStorage,
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

