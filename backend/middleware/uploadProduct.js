const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Dynamic storage for products - same approach as land uploads
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop();
    const filename = file.originalname.replace(/\.[^/.]+$/, ''); // remove extension

    // Choose folder based on field name
    let folder = 'products'; // default folder
    let resourceType = 'auto';
    
    if (file.fieldname === 'images') {
      folder = 'products/images';
      resourceType = 'image';
    } else if (file.fieldname === 'safetyDocuments') {
      folder = 'products/safety-docs';
      resourceType = 'auto'; // supports PDFs
    }

    return {
      folder,
      resource_type: resourceType,
      public_id: `${filename}-${Date.now()}`,
      format: ext
    };
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per file
  }
});

module.exports = upload;

