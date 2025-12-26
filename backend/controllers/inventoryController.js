const Product = require('../models/Product');
const Order = require('../models/Order');
const NotificationService = require('../utils/notificationService');

/**
 * @desc    Get inventory overview for vendor
 * @route   GET /api/vendor/inventory
 * @access  Private (Vendor only)
 */
exports.getInventoryOverview = async (req, res) => {
  try {
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();

    // Get all products with stock information
    const products = await Product.find({ 
      vendorId, 
      isActive: true 
    }).select('name category stock price stockStatus');

    // Calculate inventory statistics
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock <= (p.lowStockThreshold || 10) && p.stock > 0);
    const outOfStockProducts = products.filter(p => p.stock === 0);
    const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);

    // Get recent stock movements (from orders in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await Order.find({
      'items.vendorId': vendorId,
      createdAt: { $gte: thirtyDaysAgo },
      orderStatus: { $in: ['DELIVERED', 'SHIPPED'] }
    }).populate('items.productId', 'name');

    // Calculate stock movements
    const stockMovements = {};
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.vendorId.toString() === vendorId) {
          const productId = item.productId._id.toString();
          if (!stockMovements[productId]) {
            stockMovements[productId] = {
              productName: item.productId.name,
              totalSold: 0
            };
          }
          stockMovements[productId].totalSold += item.quantity;
        }
      });
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length,
          totalStockValue: totalStockValue.toFixed(2)
        },
        products: products.map(p => ({
          _id: p._id,
          name: p.name,
          category: p.category,
          stock: p.stock,
          price: p.price,
          lowStockThreshold: p.lowStockThreshold || 10,
          stockStatus: p.stockStatus,
          stockValue: (p.stock * p.price).toFixed(2)
        })),
        lowStockProducts,
        outOfStockProducts,
        recentMovements: Object.values(stockMovements).slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Get inventory overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inventory overview',
      error: error.message
    });
  }
};

/**
 * @desc    Update product stock manually
 * @route   PATCH /api/vendor/inventory/:productId/stock
 * @access  Private (Vendor only)
 */
exports.updateProductStock = async (req, res) => {
  try {
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    const { productId } = req.params;
    const { stock, reason, lowStockThreshold } = req.body;

    // Validate stock value
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative number'
      });
    }

    // Validate threshold if provided
    if (lowStockThreshold !== undefined && (typeof lowStockThreshold !== 'number' || lowStockThreshold < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Low stock threshold must be a non-negative number'
      });
    }

    // Find and verify product ownership
    const product = await Product.findOne({ 
      _id: productId, 
      vendorId,
      isActive: true 
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have access to it'
      });
    }

    const oldStock = product.stock;
    const oldThreshold = product.lowStockThreshold;
    
    product.stock = stock;
    if (lowStockThreshold !== undefined) {
      product.lowStockThreshold = lowStockThreshold;
    }
    
    await product.save();

    // Send notifications based on stock changes
    try {
      if (oldStock === 0 && stock > 0) {
        // Stock restored from out of stock
        await NotificationService.notifyStockRestored(vendorId, product, oldStock, stock);
      } else if (stock === 0 && oldStock > 0) {
        // Product went out of stock
        await NotificationService.notifyOutOfStock(vendorId, product);
      } else if (stock <= (product.lowStockThreshold || 10) && stock > 0 && oldStock > (product.lowStockThreshold || 10)) {
        // Product went into low stock
        await NotificationService.notifyLowStock(vendorId, product);
      }
    } catch (notificationError) {
      console.error('Failed to send stock update notification:', notificationError);
      // Don't fail the stock update if notification fails
    }

    // Check for stock alerts after update
    try {
      if (stock === 0 && oldStock > 0) {
        // Product went out of stock
        await NotificationService.notifyOutOfStock(vendorId, product);
      } else if (stock > 0 && stock <= (product.lowStockThreshold || 10) && oldStock > (product.lowStockThreshold || 10)) {
        // Product went into low stock
        await NotificationService.notifyLowStock(vendorId, product);
      }
    } catch (notificationError) {
      console.error('Failed to send stock alert notification:', notificationError);
    }

    // Log the stock change (you might want to create a StockMovement model for better tracking)
    console.log(`Stock updated for product ${product.name}: ${oldStock} -> ${stock}. Reason: ${reason || 'Manual update'}`);
    if (lowStockThreshold !== undefined && oldThreshold !== lowStockThreshold) {
      console.log(`Low stock threshold updated for product ${product.name}: ${oldThreshold} -> ${lowStockThreshold}`);
    }

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        productId: product._id,
        productName: product.name,
        oldStock,
        newStock: stock,
        oldThreshold,
        newThreshold: product.lowStockThreshold,
        stockStatus: product.stockStatus,
        reason: reason || 'Manual update'
      }
    });
  } catch (error) {
    console.error('Update product stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

/**
 * @desc    Get low stock alerts
 * @route   GET /api/vendor/inventory/alerts
 * @access  Private (Vendor only)
 */
exports.getLowStockAlerts = async (req, res) => {
  try {
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    const { threshold = 10 } = req.query;

    const lowStockProducts = await Product.find({
      vendorId,
      isActive: true,
      stock: { $lte: parseInt(threshold), $gt: 0 }
    }).select('name category stock price');

    const outOfStockProducts = await Product.find({
      vendorId,
      isActive: true,
      stock: 0
    }).select('name category stock price');

    res.json({
      success: true,
      data: {
        lowStockProducts: lowStockProducts.map(p => ({
          ...p.toObject(),
          alertType: 'LOW_STOCK',
          message: `Only ${p.stock} units left`
        })),
        outOfStockProducts: outOfStockProducts.map(p => ({
          ...p.toObject(),
          alertType: 'OUT_OF_STOCK',
          message: 'Product is out of stock'
        })),
        totalAlerts: lowStockProducts.length + outOfStockProducts.length
      }
    });
  } catch (error) {
    console.error('Get low stock alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock alerts',
      error: error.message
    });
  }
};

/**
 * @desc    Get stock movement history
 * @route   GET /api/vendor/inventory/movements
 * @access  Private (Vendor only)
 */
exports.getStockMovements = async (req, res) => {
  try {
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    const { days = 30, productId } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Build query for orders
    const orderQuery = {
      'items.vendorId': vendorId,
      createdAt: { $gte: startDate },
      orderStatus: { $in: ['DELIVERED', 'SHIPPED', 'PROCESSING'] }
    };

    if (productId) {
      orderQuery['items.productId'] = productId;
    }

    const orders = await Order.find(orderQuery)
      .populate('items.productId', 'name')
      .populate('buyerId', 'name')
      .sort({ createdAt: -1 });

    // Process movements
    const movements = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.vendorId.toString() === vendorId) {
          if (!productId || item.productId._id.toString() === productId) {
            movements.push({
              date: order.createdAt,
              productId: item.productId._id,
              productName: item.productId.name,
              type: 'SALE',
              quantity: -item.quantity, // Negative for sales
              orderId: order._id,
              orderNumber: order.orderNumber,
              buyerName: order.buyerId.name,
              reason: `Sale to ${order.buyerId.name}`
            });
          }
        }
      });
    });

    res.json({
      success: true,
      data: {
        movements: movements.slice(0, 100), // Limit to 100 recent movements
        totalMovements: movements.length
      }
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock movements',
      error: error.message
    });
  }
};

/**
 * @desc    Bulk update stock for multiple products
 * @route   PATCH /api/vendor/inventory/bulk-update
 * @access  Private (Vendor only)
 */
exports.bulkUpdateStock = async (req, res) => {
  try {
    const vendorId = (req.vendorId || req.vendor?._id || req.user?._id).toString();
    const { updates } = req.body; // Array of { productId, stock, reason }

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required and cannot be empty'
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { productId, stock, reason } = update;

        if (typeof stock !== 'number' || stock < 0) {
          errors.push({
            productId,
            error: 'Stock must be a non-negative number'
          });
          continue;
        }

        const product = await Product.findOne({
          _id: productId,
          vendorId,
          isActive: true
        });

        if (!product) {
          errors.push({
            productId,
            error: 'Product not found or access denied'
          });
          continue;
        }

        const oldStock = product.stock;
        product.stock = stock;
        await product.save();

        results.push({
          productId: product._id,
          productName: product.name,
          oldStock,
          newStock: stock,
          reason: reason || 'Bulk update'
        });
      } catch (err) {
        errors.push({
          productId: update.productId,
          error: err.message
        });
      }
    }

    res.json({
      success: true,
      message: `Updated ${results.length} products successfully`,
      data: {
        successful: results,
        failed: errors,
        totalProcessed: updates.length,
        successCount: results.length,
        errorCount: errors.length
      }
    });
  } catch (error) {
    console.error('Bulk update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk stock update',
      error: error.message
    });
  }
};