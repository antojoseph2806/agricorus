const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  }
}, { _id: false });

const deliveryAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{6}$/, 'Pincode must be 6 digits']
  }
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    buyerRole: {
      type: String,
      enum: ['farmer', 'landowner', 'investor'],
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function(items) {
          return items.length > 0;
        },
        message: 'Order must have at least one item'
      }
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative']
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING'
    },
    orderStatus: {
      type: String,
      enum: ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PLACED'
    },
    deliveryAddress: {
      type: deliveryAddressSchema,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'razorpay'],
      default: 'COD'
    },
    deliveredAt: {
      type: Date
    },
    cancelledAt: {
      type: Date
    },
    cancellationReason: {
      type: String,
      maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
    },
    returnStatus: {
      type: String,
      enum: ['NONE', 'REQUESTED', 'APPROVED', 'REJECTED'],
      default: 'NONE'
    },
    returnReason: {
      type: String,
      maxlength: [500, 'Return reason cannot exceed 500 characters']
    },
    returnRequestedAt: {
      type: Date
    },
    replacementStatus: {
      type: String,
      enum: ['NONE', 'REQUESTED', 'APPROVED', 'REJECTED'],
      default: 'NONE'
    },
    replacementReason: {
      type: String,
      maxlength: [500, 'Replacement reason cannot exceed 500 characters']
    },
    replacementRequestedAt: {
      type: Date
    },
    razorpayOrderId: {
      type: String,
      sparse: true
    },
    razorpayPaymentId: {
      type: String,
      sparse: true
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Indexes for efficient queries
orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'items.vendorId': 1 });

module.exports = mongoose.model('Order', orderSchema);

