const Product = require('../models/Product');
const VendorProfile = require('../models/VendorProfile');
const mongoose = require('mongoose');

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
 * @route   GET /api/marketplace/products
 * @desc    Get all active products from verified vendors (PUBLIC)
 * @access  Public
 */
exports.getMarketplaceProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query for verified vendors
    const verifiedVendors = await VendorProfile.find({ kycStatus: 'VERIFIED' })
      .select('vendorId')
      .lean();
    
    const verifiedVendorIds = verifiedVendors.map(vp => vp.vendorId);

    // Build product query
    const query = {
      isActive: true,
      stock: { $gt: 0 },
      vendorId: { $in: verifiedVendorIds }
    };

    // Category filter
    if (category && ['Fertilizers', 'Pesticides', 'Equipment & Tools'].includes(category)) {
      query.category = category;
    }

    // Search filter
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }

    // Sort options
    const sortOptions = {};
    const validSortFields = ['createdAt', 'price', 'name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('vendorId', 'businessName')
        .select('-safetyDocuments') // Don't expose safety documents in listing
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);

    // Add vendor business name from VendorProfile
    const productsWithVendor = await Promise.all(
      products.map(async (product) => {
        const vendorProfile = await VendorProfile.findOne({ vendorId: product.vendorId })
          .select('businessName')
          .lean();
        
        return {
          ...product,
          vendorBusinessName: vendorProfile?.businessName || 'Unknown Vendor',
          stockStatus: product.stock === 0 ? 'OUT_OF_STOCK' : product.stock < 10 ? 'LOW_STOCK' : 'IN_STOCK'
        };
      })
    );

    sendResponse(res, true, 'Products retrieved successfully', {
      products: productsWithVendor,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalProducts: total,
        limit: limitNum
      },
      filters: {
        category: category || 'all',
        search: search || '',
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Get marketplace products error:', error);
    sendResponse(res, false, 'Error retrieving products', null, 500);
  }
};

/**
 * @route   GET /api/marketplace/products/:id
 * @desc    Get single product details (PUBLIC)
 * @access  Public
 */
exports.getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return sendResponse(res, false, 'Invalid product ID', null, 400);
    }

    // Find product
    const product = await Product.findById(id).populate('vendorId', 'businessName').lean();

    if (!product) {
      return sendResponse(res, false, 'Product not found', null, 404);
    }

    // Check if vendor is verified
    const vendorProfile = await VendorProfile.findOne({ vendorId: product.vendorId })
      .select('businessName kycStatus')
      .lean();

    if (!vendorProfile || vendorProfile.kycStatus !== 'VERIFIED') {
      return sendResponse(res, false, 'Product not available', null, 404);
    }

    // Check if product is active and in stock
    if (!product.isActive || product.stock === 0) {
      return sendResponse(res, false, 'Product not available', null, 404);
    }

    // Add vendor info and stock status
    const productDetails = {
      ...product,
      vendorBusinessName: vendorProfile.businessName,
      stockStatus: product.stock === 0 ? 'OUT_OF_STOCK' : product.stock < 10 ? 'LOW_STOCK' : 'IN_STOCK',
      // Include safety documents for pesticides (view-only)
      safetyDocuments: product.category === 'Pesticides' ? product.safetyDocuments : []
    };

    sendResponse(res, true, 'Product details retrieved successfully', productDetails);
  } catch (error) {
    console.error('Get product details error:', error);
    sendResponse(res, false, 'Error retrieving product details', null, 500);
  }
};


/**
 * @route   POST /api/marketplace/products/batch
 * @desc    Get multiple products by IDs (for guest cart)
 * @access  Public
 */
exports.getBatchProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return sendResponse(res, false, 'Product IDs are required', null, 400);
    }

    // Validate all IDs
    const validIds = productIds.filter(id => isValidObjectId(id));
    
    if (validIds.length === 0) {
      return sendResponse(res, false, 'No valid product IDs provided', null, 400);
    }

    // Find products
    const products = await Product.find({
      _id: { $in: validIds },
      isActive: true
    }).lean();

    // Add vendor info and stock status
    const productsWithVendor = await Promise.all(
      products.map(async (product) => {
        const vendorProfile = await VendorProfile.findOne({ vendorId: product.vendorId })
          .select('businessName')
          .lean();
        
        return {
          _id: product._id,
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
          images: product.images,
          vendorId: product.vendorId,
          vendorBusinessName: vendorProfile?.businessName || 'Unknown Vendor',
          stockStatus: product.stock === 0 ? 'OUT_OF_STOCK' : product.stock < 10 ? 'LOW_STOCK' : 'IN_STOCK'
        };
      })
    );

    sendResponse(res, true, 'Products retrieved successfully', {
      products: productsWithVendor
    });
  } catch (error) {
    console.error('Get batch products error:', error);
    sendResponse(res, false, 'Error retrieving products', null, 500);
  }
};
