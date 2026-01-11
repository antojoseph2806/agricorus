const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Address = require('../models/Address');
const { sendResponse } = require('../utils/responseHelper');

// Get all addresses for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.id })
      .sort({ isDefault: -1, createdAt: -1 });
    
    sendResponse(res, true, 'Addresses fetched successfully', addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    sendResponse(res, false, 'Failed to fetch addresses', null, 500);
  }
});

// Create new address
router.post('/', auth, async (req, res) => {
  try {
    const { label, street, district, state, pincode, isDefault } = req.body;

    // Validation
    if (!label || !street || !district || !state || !pincode) {
      return sendResponse(res, false, 'All address fields are required', null, 400);
    }

    // Validate pincode format
    if (!/^\d{6}$/.test(pincode)) {
      return sendResponse(res, false, 'Pincode must be 6 digits', null, 400);
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await Address.updateMany(
        { userId: req.user.id },
        { isDefault: false }
      );
    }

    // If this is the first address, make it default
    const existingAddressCount = await Address.countDocuments({ userId: req.user.id });
    const shouldBeDefault = isDefault || existingAddressCount === 0;

    const address = new Address({
      userId: req.user.id,
      label: label.trim(),
      street: street.trim(),
      district: district.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      isDefault: shouldBeDefault
    });

    await address.save();
    sendResponse(res, true, 'Address created successfully', address, 201);
  } catch (error) {
    console.error('Error creating address:', error);
    sendResponse(res, false, 'Failed to create address', null, 500);
  }
});

// Update address
router.put('/:id', auth, async (req, res) => {
  try {
    const { label, street, district, state, pincode, isDefault } = req.body;
    const addressId = req.params.id;

    // Validation
    if (!label || !street || !district || !state || !pincode) {
      return sendResponse(res, false, 'All address fields are required', null, 400);
    }

    // Validate pincode format
    if (!/^\d{6}$/.test(pincode)) {
      return sendResponse(res, false, 'Pincode must be 6 digits', null, 400);
    }

    // Find address and verify ownership
    const address = await Address.findOne({ _id: addressId, userId: req.user.id });
    if (!address) {
      return sendResponse(res, false, 'Address not found', null, 404);
    }

    // If this is set as default, unset other default addresses
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { userId: req.user.id, _id: { $ne: addressId } },
        { isDefault: false }
      );
    }

    // Update address
    address.label = label.trim();
    address.street = street.trim();
    address.district = district.trim();
    address.state = state.trim();
    address.pincode = pincode.trim();
    address.isDefault = isDefault;

    await address.save();
    sendResponse(res, true, 'Address updated successfully', address);
  } catch (error) {
    console.error('Error updating address:', error);
    sendResponse(res, false, 'Failed to update address', null, 500);
  }
});

// Set address as default
router.put('/:id/set-default', auth, async (req, res) => {
  try {
    const addressId = req.params.id;

    // Find address and verify ownership
    const address = await Address.findOne({ _id: addressId, userId: req.user.id });
    if (!address) {
      return sendResponse(res, false, 'Address not found', null, 404);
    }

    // Unset all other default addresses for this user
    await Address.updateMany(
      { userId: req.user.id },
      { isDefault: false }
    );

    // Set this address as default
    address.isDefault = true;
    await address.save();

    sendResponse(res, true, 'Default address updated successfully', address);
  } catch (error) {
    console.error('Error setting default address:', error);
    sendResponse(res, false, 'Failed to set default address', null, 500);
  }
});

// Delete address
router.delete('/:id', auth, async (req, res) => {
  try {
    const addressId = req.params.id;

    // Find address and verify ownership
    const address = await Address.findOne({ _id: addressId, userId: req.user.id });
    if (!address) {
      return sendResponse(res, false, 'Address not found', null, 404);
    }

    // If deleting default address, set another address as default
    if (address.isDefault) {
      const otherAddress = await Address.findOne({ 
        userId: req.user.id, 
        _id: { $ne: addressId } 
      });
      
      if (otherAddress) {
        otherAddress.isDefault = true;
        await otherAddress.save();
      }
    }

    await Address.findByIdAndDelete(addressId);
    sendResponse(res, true, 'Address deleted successfully', null);
  } catch (error) {
    console.error('Error deleting address:', error);
    sendResponse(res, false, 'Failed to delete address', null, 500);
  }
});

module.exports = router;