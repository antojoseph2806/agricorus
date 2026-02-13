const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage for product images
const productImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'agricorus/products/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `product-image-${uniqueSuffix}`;
    }
  }
});

// Storage for safety documents (PDFs)
const safetyDocumentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'agricorus/products/safety-docs',
    allowed_formats: ['pdf'],
    resource_type: 'raw', // For non-image files
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `safety-doc-${uniqueSuffix}`;
    }
  }
});

// Combined storage that routes files based on field name
const combinedStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    if (file.fieldname === 'images') {
      return {
        folder: 'agricorus/products/images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
        public_id: `product-image-${Date.now()}-${Math.round(Math.random() * 1E9)}`
      };
    } else if (file.fieldname === 'safetyDocuments') {
      return {
        folder: 'agricorus/products/safety-docs',
        allowed_formats: ['pdf'],
        resource_type: 'raw',
        public_id: `safety-doc-${Date.now()}-${Math.round(Math.random() * 1E9)}`
      };
    }
    throw new Error('Invalid field name');
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

// Helper function to delete files from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return true;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

// Helper function to extract public_id from Cloudinary URL
const extractPublicId = (url) => {
  if (!url) return null;
  
  // Extract public_id from Cloudinary URL
  // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/v{version}/{public_id}.{format}
  const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
  if (matches && matches[1]) {
    return matches[1];
  }
  
  // Alternative format without version
  const matches2 = url.match(/\/upload\/(.+)\.\w+$/);
  if (matches2 && matches2[1]) {
    return matches2[1];
  }
  
  return null;
};

module.exports = {
  cloudinary,
  productImageStorage,
  safetyDocumentStorage,
  combinedStorage,
  imageFilter,
  pdfFilter,
  combinedFilter,
  deleteFromCloudinary,
  extractPublicId
};
