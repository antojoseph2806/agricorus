const express = require('express');
const router = express.Router();
const Tesseract = require('tesseract.js');
const upload = require('../middleware/upload'); // Cloudinary multer
const KYC = require('../models/kycModel');
const protect = require('../middleware/auth');

// ------------------------------
// 📌 KYC Upload + OCR Controller
// ------------------------------
router.post('/verify', protect, upload.single('document'), async (req, res) => {
  try {
    const { documentType } = req.body;

    // -------------------
    // Prevent multiple submissions
    // -------------------
    const existingUserKYC = await KYC.findOne({ userId: req.user.id });
    if (existingUserKYC) {
      if (existingUserKYC.status === 'Verified') {
        return res.status(400).json({ message: 'You are already verified' });
      } else {
        return res.status(400).json({ message: 'Your KYC is already submitted and pending verification' });
      }
    }

    // -------------------
    // Basic file validation
    // -------------------
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'Document image is required' });
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only JPG or PNG images allowed' });
    }

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: 'File too large. Max 5MB allowed' });
    }

    // -------------------
    // Cloudinary URL
    // -------------------
    const fileUrl = req.file.path;
    console.log(`📝 File uploaded to Cloudinary: ${fileUrl}`);

    // -------------------
    // OCR Extraction
    // -------------------
    const { data: { text } } = await Tesseract.recognize(fileUrl, 'eng', {
      logger: m => console.log(m)
    });

    console.log('📤 OCR Extracted Text:', text);

    // -------------------
    // Name verification
    // -------------------
    const registeredName = req.user.name.trim().toLowerCase();
    const ocrTextLower = text.replace(/\s+/g, ' ').toLowerCase();
    if (!ocrTextLower.includes(registeredName)) {
      return res.status(400).json({
        message: 'The document name does not match your registered name'
      });
    }

    // -------------------
    // Extract number & validate
    // -------------------
    let extractedNumber = null;

    if (documentType === 'Aadhaar') {
      const aadhaarRegex = /\b\d{4}\s\d{4}\s\d{4}\b/;
      const match = text.match(aadhaarRegex);
      if (!match) return res.status(400).json({ message: 'Invalid Aadhaar format' });
      extractedNumber = match[0];
    } else if (documentType === 'PAN') {
      const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/;
      const match = text.match(panRegex);
      if (!match) return res.status(400).json({ message: 'Invalid PAN format' });
      extractedNumber = match[0];
    } else {
      return res.status(400).json({ message: 'Unsupported document type' });
    }

    // -------------------
    // Check duplicate document across users
    // -------------------
    const existingDoc = await KYC.findOne({ extractedNumber });
    if (existingDoc) {
      return res.status(400).json({
        message: `This ${documentType} is already registered by another user`
      });
    }

    // -------------------
    // Save KYC record in DB
    // -------------------
    const kycRecord = await KYC.create({
      userId: req.user.id,
      documentType,
      documentImage: fileUrl,
      extractedText: text,
      extractedNumber,
      status: 'Pending' // pending admin approval
    });

    res.status(200).json({
      message: 'KYC submitted successfully. Pending verification.',
      documentType,
      extractedNumber,
      kycId: kycRecord._id,
      documentUrl: fileUrl
    });

  } catch (error) {
    console.error('❌ KYC OCR Error:', error);
    res.status(500).json({ message: 'KYC verification failed', error: error.message });
  }
});

// ------------------------------
// 📌 Get KYC Status by Logged-in User
// ------------------------------
router.get('/status', protect, async (req, res) => {
  try {
    const record = await KYC.findOne({ userId: req.user.id });
    if (!record) {
      return res.status(404).json({ message: 'No KYC record found' });
    }
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching KYC status', error: error.message });
  }
});

module.exports = router;
