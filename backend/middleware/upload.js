const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 🔧 Use 'auto' to let Cloudinary decide (image or raw)
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split(".").pop();
    const filename = file.originalname.replace(/\.[^/.]+$/, ""); // remove extension

    return {
      folder: "lands",
      resource_type: "auto", // 🔥 Key trick to support PDFs & images in same uploader
      public_id: filename,
      format: ext // optional
    };
  }
});

const upload = multer({ storage });
module.exports = upload;
