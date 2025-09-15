const express = require("express");
const multer = require("multer");
const path = require("path");
const vision = require("@google-cloud/vision");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/kyc");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Google Vision client
const client = new vision.ImageAnnotatorClient({
  keyFilename: path.join(__dirname, "../service-account.json"),
});

// Regex patterns
const patterns = {
  aadhaar: /\b\d{4}\s?\d{4}\s?\d{4}\b/,
  pan: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/,
  voter: /\b[A-Z]{3}[0-9]{7}\b/,
  license: /\b[A-Z]{2}\d{2}\s?\d{7,13}\b/,
};

// OCR Route
router.post("/upload", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Perform OCR
    const [result] = await client.textDetection(req.file.path);
    const detections = result.textAnnotations;
    const fullText = detections[0] ? detections[0].description : "";

    // Detect document type
    let docType = "Unknown";
    let matchedValue = null;

    if (patterns.aadhaar.test(fullText)) {
      docType = "Aadhaar";
      matchedValue = fullText.match(patterns.aadhaar)[0];
    } else if (patterns.pan.test(fullText)) {
      docType = "PAN";
      matchedValue = fullText.match(patterns.pan)[0];
    } else if (patterns.voter.test(fullText)) {
      docType = "Voter ID";
      matchedValue = fullText.match(patterns.voter)[0];
    } else if (patterns.license.test(fullText)) {
      docType = "Driving License";
      matchedValue = fullText.match(patterns.license)[0];
    }

    res.json({
      message: "OCR successful",
      documentType: docType,
      extractedValue: matchedValue,
      fullText,
    });
  } catch (err) {
    console.error("OCR Error:", err);
    res.status(500).json({ error: "OCR failed" });
  }
});

module.exports = router;
