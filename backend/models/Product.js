const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    category: {
      type: String,
      enum: {
        values: ['Fertilizers', 'Pesticides', 'Equipment & Tools'],
        message: 'Category must be one of: Fertilizers, Pesticides, Equipment & Tools'
      },
      required: [true, 'Product category is required']
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      min: [0, 'Low stock threshold cannot be negative'],
      default: 10
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    images: {
      type: [String],
      validate: {
        validator: function(images) {
          return images.length <= 5;
        },
        message: 'Maximum 5 images allowed'
      },
      default: []
    },
    safetyDocuments: {
      type: [String],
      default: []
    },
    warrantyPeriod: {
      type: Number,
      min: [0, 'Warranty period cannot be negative']
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

// Custom validation: Safety documents required for Pesticides
productSchema.pre('validate', function(next) {
  if (this.category === 'Pesticides' && (!this.safetyDocuments || this.safetyDocuments.length === 0)) {
    this.invalidate('safetyDocuments', 'Safety documents are required for Pesticides');
  }
  next();
});

// Virtual field for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) {
    return 'OUT_OF_STOCK';
  } else if (this.stock <= (this.lowStockThreshold || 10)) {
    return 'LOW_STOCK';
  }
  return 'IN_STOCK';
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Index for efficient queries
productSchema.index({ vendorId: 1, isActive: 1 });
productSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);

