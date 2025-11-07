// utils/multerProjects.js
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "projects");
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, `${ts}_${safe}`);
  }
});

function fileFilter(_req, file, cb) {
  const ok = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (ok.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Only image files are allowed (jpeg, png, webp, gif)"));
}

const uploadImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 } // 5MB each, up to 6
});

module.exports = { uploadImages, UPLOAD_ROOT };
