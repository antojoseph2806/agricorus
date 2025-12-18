const Product = require('../models/Product');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

/**
 * Helper function to format API response
 */
const sendResponse = (res, success, message, data = null, statusCode = 200) => {
  res.status(statusCode).json({
    success,
    message,
    data
  });
};

/**
 * Helper function to validate ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Helper function to delete files
 */
const deleteFiles = (filePaths) => {
  filePaths.forEach(filePath => {
    if (filePath) {
      const fullPath = path.join(__dirname, '..', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
  });
};

/**
 * @route   POST /api/vendor/products
 * @desc    Create a new product
 * @access  Private (Vendor only)
 */
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, stock, description, warrantyPeriod } = req.body;
    const vendorId = req.vendorId;

    // Validate required fields
    if (!name || !category || price === undefined || stock === undefined) {
      return sendResponse(res, false, 'Missing required fields: name, category, price, stock', null, 400);
    }

    // Validate category
    const validCategories = ['Fertilizers', 'Pesticides', 'Equipment & Tools'];
    if (!validCategories.includes(category)) {
      return sendResponse(res, false, 'Invalid category. Must be one of: Fertilizers, Pesticides, Equipment & Tools', null, 400);
    }

    // Validate price and stock
    if (price < 0 || stock < 0) {
      return sendResponse(res, false, 'Price and stock cannot be negative', null, 400);
    }

    // Handle images (from multer.fields, images is already an array)
    const images = [];
    if (req.files && req.files.images) {
      const imageFiles = req.files.images;
      if (imageFiles.length > 5) {
        // Delete uploaded files if validation fails
        imageFiles.forEach(file => {
          const filePath = path.join(__dirname, '../uploads/products/images', file.filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
        return sendResponse(res, false, 'Maximum 5 images allowed', null, 400);
      }
      images.push(...imageFiles.map(file => `/uploads/products/images/${file.filename}`));
    }

    // Handle safety documents (from multer.fields, safetyDocuments is already an array)
    const safetyDocuments = [];
    if (req.files && req.files.safetyDocuments) {
      const docFiles = req.files.safetyDocuments;
      safetyDocuments.push(...docFiles.map(file => `/uploads/products/safety-docs/${file.filename}`));
    }

    // Validate safety documents for Pesticides
    if (category === 'Pesticides' && safetyDocuments.length === 0) {
      // Clean up uploaded images
      if (images.length > 0) {
        images.forEach(img => {
          const filePath = path.join(__dirname, '..', img);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      }
      return sendResponse(res, false, 'Safety documents are required for Pesticides', null, 400);
    }

    // Validate warrantyPeriod for Equipment
    if (category === 'Equipment & Tools' && warrantyPeriod !== undefined && warrantyPeriod < 0) {
      return sendResponse(res, false, 'Warranty period cannot be negative', null, 400);
    }

    // Create product
    const product = await Product.create({
      vendorId,
      name,
      category,
      price: parseFloat(price),
      stock: parseInt(stock),
      description: description || '',
      images,
      safetyDocuments,
      warrantyPeriod: category === 'Equipment & Tools' && warrantyPeriod !== undefined ? parseInt(warrantyPeriod) : undefined,
      isActive: true
    });

    sendResponse(res, true, 'Product created successfully', product, 201);
  } catch (error) {
    console.error('Create product error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      if (req.files.images) {
        req.files.images.forEach(file => {
          const filePath = path.join(__dirname, '../uploads/products/images', file.filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      }
      if (req.files.safetyDocuments) {
        req.files.safetyDocuments.forEach(file => {
          const filePath = path.join(__dirname, '../uploads/products/safety-docs', file.filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      }
    }

    sendResponse(res, false, error.message || 'Error creating product', null, 500);
  }
};

/**
 * @route   GET /api/vendor/products
 * @desc    Get all products of logged-in vendor
 * @access  Private (Vendor only)
 */
exports.getVendorProducts = async (req, res) => {
  try {
    const vendorId = req.vendorId;
    const { isActive } = req.query;

    // Build query
    const query = { vendorId };
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .select('-__v');

    sendResponse(res, true, 'Products retrieved successfully', products);
  } catch (error) {
    console.error('Get vendor products error:', error);
    sendResponse(res, false, 'Error retrieving products', null, 500);
  }
};

/**
 * @route   GET /api/vendor/products/:id
 * @desc    Get single product by ID (vendor-owned only)
 * @access  Private (Vendor only)
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.vendorId;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return sendResponse(res, false, 'Invalid product ID', null, 400);
    }

    const product = await Product.findOne({ _id: id, vendorId });

    if (!product) {
      return sendResponse(res, false, 'Product not found or access denied', null, 404);
    }

    sendResponse(res, true, 'Product retrieved successfully', product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    sendResponse(res, false, 'Error retrieving product', null, 500);
  }
};

/**
 * @route   PUT /api/vendor/products/:id
 * @desc    Update product details
 * @access  Private (Vendor only)
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.vendorId;
    const { name, category, price, stock, description, warrantyPeriod } = req.body;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return sendResponse(res, false, 'Invalid product ID', null, 400);
    }

    // Find product and verify ownership
    const product = await Product.findOne({ _id: id, vendorId });
    if (!product) {
      return sendResponse(res, false, 'Product not found or access denied', null, 404);
    }

    // Validate category if provided
    if (category) {
      const validCategories = ['Fertilizers', 'Pesticides', 'Equipment & Tools'];
      if (!validCategories.includes(category)) {
        return sendResponse(res, false, 'Invalid category', null, 400);
      }
    }

    // Validate price and stock
    if (price !== undefined && price < 0) {
      return sendResponse(res, false, 'Price cannot be negative', null, 400);
    }
    if (stock !== undefined && stock < 0) {
      return sendResponse(res, false, 'Stock cannot be negative', null, 400);
    }

    // Handle new images (from multer.fields, images is already an array)
    if (req.files && req.files.images) {
      const imageFiles = req.files.images;
      if (imageFiles.length > 5) {
        imageFiles.forEach(file => {
          const filePath = path.join(__dirname, '../uploads/products/images', file.filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
        return sendResponse(res, false, 'Maximum 5 images allowed', null, 400);
      }

      // Delete old images
      if (product.images && product.images.length > 0) {
        deleteFiles(product.images);
      }

      // Add new images
      product.images = imageFiles.map(file => `/uploads/products/images/${file.filename}`);
    }

    // Handle new safety documents (from multer.fields, safetyDocuments is already an array)
    if (req.files && req.files.safetyDocuments) {
      const docFiles = req.files.safetyDocuments;

      // Delete old documents
      if (product.safetyDocuments && product.safetyDocuments.length > 0) {
        deleteFiles(product.safetyDocuments);
      }

      // Add new documents
      product.safetyDocuments = docFiles.map(file => `/uploads/products/safety-docs/${file.filename}`);
    }

    // Validate safety documents for Pesticides
    const finalCategory = category || product.category;
    if (finalCategory === 'Pesticides' && (!product.safetyDocuments || product.safetyDocuments.length === 0)) {
      return sendResponse(res, false, 'Safety documents are required for Pesticides', null, 400);
    }

    // Update fields
    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock);
    if (description !== undefined) product.description = description;
    
    // Handle warrantyPeriod
    if (finalCategory === 'Equipment & Tools') {
      if (warrantyPeriod !== undefined) {
        if (warrantyPeriod < 0) {
          return sendResponse(res, false, 'Warranty period cannot be negative', null, 400);
        }
        product.warrantyPeriod = parseInt(warrantyPeriod);
      }
    } else {
      product.warrantyPeriod = undefined;
    }

    const updatedProduct = await product.save();
    sendResponse(res, true, 'Product updated successfully', updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    sendResponse(res, false, error.message || 'Error updating product', null, 500);
  }
};

/**
 * @route   PATCH /api/vendor/products/:id/stock
 * @desc    Update stock & price
 * @access  Private (Vendor only)
 */
exports.updateStockAndPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.vendorId;
    const { stock, price } = req.body;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return sendResponse(res, false, 'Invalid product ID', null, 400);
    }

    // Validate at least one field is provided
    if (stock === undefined && price === undefined) {
      return sendResponse(res, false, 'At least one of stock or price must be provided', null, 400);
    }

    // Find product and verify ownership
    const product = await Product.findOne({ _id: id, vendorId });
    if (!product) {
      return sendResponse(res, false, 'Product not found or access denied', null, 404);
    }

    // Validate and update stock
    if (stock !== undefined) {
      if (stock < 0) {
        return sendResponse(res, false, 'Stock cannot be negative', null, 400);
      }
      product.stock = parseInt(stock);
    }

    // Validate and update price
    if (price !== undefined) {
      if (price < 0) {
        return sendResponse(res, false, 'Price cannot be negative', null, 400);
      }
      product.price = parseFloat(price);
    }

    const updatedProduct = await product.save();
    sendResponse(res, true, 'Stock and price updated successfully', updatedProduct);
  } catch (error) {
    console.error('Update stock and price error:', error);
    sendResponse(res, false, 'Error updating stock and price', null, 500);
  }
};

/**
 * @route   DELETE /api/vendor/products/:id
 * @desc    Soft delete product (set isActive=false)
 * @access  Private (Vendor only)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.vendorId;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return sendResponse(res, false, 'Invalid product ID', null, 400);
    }

    // Find product and verify ownership
    const product = await Product.findOne({ _id: id, vendorId });
    if (!product) {
      return sendResponse(res, false, 'Product not found or access denied', null, 404);
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    sendResponse(res, true, 'Product deleted successfully', { id: product._id, isActive: false });
  } catch (error) {
    console.error('Delete product error:', error);
    sendResponse(res, false, 'Error deleting product', null, 500);
  }
};

/**
 * @route   PATCH /api/vendor/products/:id/inventory
 * @desc    Update inventory (stock, price, isActive)
 * @access  Private (Vendor only)
 */
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.vendorId;
    const { stock, price, isActive } = req.body;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return sendResponse(res, false, 'Invalid product ID', null, 400);
    }

    // Find product and verify ownership
    const product = await Product.findOne({ _id: id, vendorId });
    if (!product) {
      return sendResponse(res, false, 'Product not found or access denied', null, 404);
    }

    // Business rule: Prevent inventory update on inactive products unless re-enabling
    if (!product.isActive && isActive !== true && (stock !== undefined || price !== undefined)) {
      return sendResponse(res, false, 'Cannot update inventory for inactive products. Please activate the product first.', null, 400);
    }

    // Validate and update stock
    if (stock !== undefined) {
      if (stock < 0) {
        return sendResponse(res, false, 'Stock cannot be negative', null, 400);
      }
      product.stock = parseInt(stock);
    }

    // Validate and update price
    if (price !== undefined) {
      if (price <= 0) {
        return sendResponse(res, false, 'Price must be greater than 0', null, 400);
      }
      product.price = parseFloat(price);
    }

    // Update isActive status
    if (isActive !== undefined) {
      product.isActive = isActive;
    }

    const updatedProduct = await product.save();
    
    // Include stockStatus in response
    const responseData = updatedProduct.toObject();
    responseData.stockStatus = updatedProduct.stockStatus;

    sendResponse(res, true, 'Inventory updated successfully', responseData);
  } catch (error) {
    console.error('Update inventory error:', error);
    sendResponse(res, false, error.message || 'Error updating inventory', null, 500);
  }
};

