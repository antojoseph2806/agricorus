// routes/payoutRoutes.js
const express = require("express");
const router = express.Router();
const PayoutMethod = require("../models/PayoutMethod");
const auth = require("../middleware/auth");

// Utility functions for validation
const isValidUPI = (upiId) => /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId);
const isValidIFSC = (ifsc) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
const isValidAccountNumber = (acc) => /^\d{9,18}$/.test(acc);
const isNonEmptyString = (str) => typeof str === "string" && str.trim().length > 0;

// ✅ Add UPI payout method
router.post("/add-upi", auth, async (req, res) => {
  try {
    const { name, upiId, isDefault } = req.body;

    if (!isNonEmptyString(name)) {
      return res.status(400).json({ error: "Name is required and must be valid." });
    }
    if (!isNonEmptyString(upiId) || !isValidUPI(upiId)) {
      return res.status(400).json({ error: "Invalid UPI ID format." });
    }

    if (isDefault) {
      await PayoutMethod.updateMany(
        { user: req.user.id, role: req.user.role },
        { isDefault: false }
      );
    }

    const payout = new PayoutMethod({
      user: req.user.id,
      role: req.user.role,   // store role too
      type: "upi",
      name: name.trim(),
      upiId: upiId.trim(),
      isDefault: isDefault || false,
    });

    await payout.save();
    res.status(201).json({ message: "UPI payout method added successfully", payout });
  } catch (err) {
    console.error("Error adding UPI method:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Add Bank payout method
router.post("/add-bank", auth, async (req, res) => {
  try {
    const { accountHolderName, accountNumber, ifscCode, bankName, isDefault } = req.body;

    if (!isNonEmptyString(accountHolderName)) {
      return res.status(400).json({ error: "Account holder name is required." });
    }
    if (!isValidAccountNumber(accountNumber)) {
      return res.status(400).json({ error: "Invalid account number." });
    }
    if (!isValidIFSC(ifscCode)) {
      return res.status(400).json({ error: "Invalid IFSC code." });
    }
    if (!isNonEmptyString(bankName)) {
      return res.status(400).json({ error: "Bank name is required." });
    }

    if (isDefault) {
      await PayoutMethod.updateMany(
        { user: req.user.id, role: req.user.role },
        { isDefault: false }
      );
    }

    const payout = new PayoutMethod({
      user: req.user.id,
      role: req.user.role,
      type: "bank",
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim(),
      bankName: bankName.trim(),
      isDefault: isDefault || false,
    });

    await payout.save();
    res.status(201).json({ message: "Bank payout method added successfully", payout });
  } catch (err) {
    console.error("Error adding bank method:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Update payout method
router.put("/:id", auth, async (req, res) => {
  try {
    const payout = await PayoutMethod.findOne({
      _id: req.params.id,
      user: req.user.id,
      role: req.user.role,
    });
    if (!payout) return res.status(404).json({ error: "Payout method not found" });

    const { name, upiId, accountHolderName, accountNumber, ifscCode, bankName, isDefault } = req.body;

    if (payout.type === "upi") {
      if (name && !isNonEmptyString(name)) return res.status(400).json({ error: "Invalid name." });
      if (upiId && !isValidUPI(upiId)) return res.status(400).json({ error: "Invalid UPI ID." });
      if (name) payout.name = name.trim();
      if (upiId) payout.upiId = upiId.trim();
    } else if (payout.type === "bank") {
      if (accountHolderName && !isNonEmptyString(accountHolderName)) return res.status(400).json({ error: "Invalid account holder name." });
      if (accountNumber && !isValidAccountNumber(accountNumber)) return res.status(400).json({ error: "Invalid account number." });
      if (ifscCode && !isValidIFSC(ifscCode)) return res.status(400).json({ error: "Invalid IFSC code." });
      if (bankName && !isNonEmptyString(bankName)) return res.status(400).json({ error: "Invalid bank name." });

      if (accountHolderName) payout.accountHolderName = accountHolderName.trim();
      if (accountNumber) payout.accountNumber = accountNumber.trim();
      if (ifscCode) payout.ifscCode = ifscCode.trim();
      if (bankName) payout.bankName = bankName.trim();
    }

    if (isDefault === true) {
      await PayoutMethod.updateMany(
        { user: req.user.id, role: req.user.role },
        { isDefault: false }
      );
      payout.isDefault = true;
    }

    await payout.save();
    res.json({ message: "Payout method updated", payout });
  } catch (err) {
    console.error("Error updating payout method:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// ✅ Delete payout method
router.delete("/:id", auth, async (req, res) => {
  try {
    const payout = await PayoutMethod.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id,
      role: req.user.role
    });
    if (!payout) return res.status(404).json({ error: "Payout method not found" });
    res.json({ message: "Payout method deleted" });
  } catch (err) {
    console.error("Error deleting payout method:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// ✅ Get all payout methods for logged-in user (based on role)
router.get("/", auth, async (req, res) => {
  try {
    const methods = await PayoutMethod.find({ user: req.user.id, role: req.user.role });
    res.json(methods);
  } catch (err) {
    console.error("Error fetching payout methods:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
