const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
  deleteFromCloudinary,
  extractPublicId
};
