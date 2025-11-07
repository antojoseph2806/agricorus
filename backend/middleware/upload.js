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

// Dynamic storage: choose folder based on route or file type
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split(".").pop();
    const filename = file.originalname.replace(/\.[^/.]+$/, ""); // remove extension

    // Example: use different folders for KYC vs other uploads
    let folder = "lands"; // default folder
    if (req.baseUrl.includes("kyc") || file.fieldname === "document") {
      folder = "kyc_docs"; // store KYC files here
    }

    return {
      folder,
      resource_type: "auto", // supports images & PDFs
      public_id: filename,
      format: ext // optional
    };
  }
});

const upload = multer({ storage });
module.exports = upload;
