const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Otp = require('../models/Otp');
const User = require('../models/User');

// SEND OTP
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  try {
    console.log('Looking for user with phone:', phone);
    const user = await User.findOne({ phone });

    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ phone, otp });
    console.log('Generated OTP:', otp);

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: phone,
        sender_id: 'FSTSMS'
      })
    });

    const data = await response.json();
    console.log('Fast2SMS response:', data);

    if (response.ok && data.return) {
      res.json({ message: 'OTP sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send OTP', error: data });
    }

  } catch (err) {
    console.error('Error in /send-otp:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const record = await Otp.findOne({ phone, otp });
    if (!record) return res.status(400).json({ message: 'Invalid or expired OTP' });

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  const { phone, otp, newPassword } = req.body;

  try {
    const record = await Otp.findOne({ phone, otp });
    if (!record) return res.status(400).json({ message: 'Invalid or expired OTP' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ phone }, { password: hashedPassword });
    await Otp.deleteMany({ phone });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
