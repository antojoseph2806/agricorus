# Stock & Inventory Control System

## Overview
A comprehensive inventory management system for vendors in the agricultural marketplace platform. This system provides real-time stock monitoring, automated stock reduction, low-stock alerts, and manual stock management capabilities.

## Features Implemented

### 1. Current Stock Count
- **Real-time stock display** for all vendor products
- **Stock value calculation** (quantity × price)
- **Product categorization** (Fertilizers, Pesticides, Equipment & Tools)
- **Search and filter** functionality by category and stock status

### 2. Low-Stock Alerts
- **Customizable threshold** per product (default: 10 units)
- **Visual alerts** with color-coded status indicators:
  - 🟢 **IN_STOCK**: Above threshold
  - 🟡 **LOW_STOCK**: At or below threshold but > 0
  - 🔴 **OUT_OF_STOCK**: 0 units
- **Alert dashboard** showing products requiring attention
- **Widget integration** on vendor dashboard for quick overview

### 3. Manual Stock Update
- **Individual product updates** with reason tracking
- **Bulk stock updates** for multiple products
- **Threshold management** - set custom low-stock alerts per product
- **Update history** with timestamps and reasons
- **Quick update modal** for fast stock adjustments

### 4. Auto Stock Reduction After Order
- **Automatic stock deduction** when orders are confirmed/processing
- **Stock restoration** if orders are cancelled
- **Order status tracking** with stock movement logs
- **Prevents overselling** by real-time stock validation
- **Audit trail** in order notes showing stock changes

## API Endpoints

### Inventory Management
```
GET    /api/vendor/inventory              # Get inventory overview
GET    /api/vendor/inventory/alerts       # Get low stock alerts
GET    /api/vendor/inventory/movements    # Get stock movement history
PATCH  /api/vendor/inventory/:id/stock   # Update product stock
PATCH  /api/vendor/inventory/bulk-update # Bulk update multiple products
```

### Order Management (Enhanced)
```
PATCH  /api/vendor/orders/:id/status     # Update order status (with auto stock reduction)
```

## Database Schema Updates

### Product Model Enhancements
```javascript
{
  stock: Number,                    // Current stock quantity
  lowStockThreshold: Number,        // Custom alert threshold (default: 10)
  stockStatus: Virtual,             // Computed: IN_STOCK, LOW_STOCK, OUT_OF_STOCK
}
```

## Frontend Components

### Main Pages
- **`VendorInventory.tsx`** - Complete inventory management interface
- **`VendorDashboard.tsx`** - Enhanced with inventory widget

### Reusable Components
- **`InventoryWidget.tsx`** - Dashboard widget showing stock overview
- **`QuickStockUpdate.tsx`** - Modal for fast stock updates

### Navigation
- Added "Inventory" section to vendor sidebar
- Quick access from dashboard and product management

## Key Features in Detail

### Stock Status Indicators
- **Visual status badges** with icons and colors
- **Real-time updates** when stock changes
- **Threshold-based calculations** using custom or default values

### Stock Movement Tracking
- **Order-based movements** (sales reduce stock)
- **Manual adjustments** with reason tracking
- **30-day movement history** with buyer information
- **Audit trail** for compliance and analysis

### Alert System
- **Proactive notifications** for low/out-of-stock items
- **Customizable thresholds** per product
- **Dashboard integration** for immediate visibility
- **Action buttons** for quick stock updates

### Auto Stock Management
- **Triggered on order confirmation** (CONFIRMED/PROCESSING status)
- **Stock restoration** on order cancellation
- **Prevents negative stock** (minimum 0)
- **Logged in order notes** for transparency

## Usage Instructions

### For Vendors:
1. **Monitor Stock**: Visit `/vendor/inventory` for complete overview
2. **Update Stock**: Click edit icon next to any product
3. **Set Alerts**: Customize low-stock thresholds per product
4. **View Alerts**: Check dashboard widget or alerts tab
5. **Track Changes**: Review stock movements in history tab

### Auto Stock Reduction:
- Stock automatically reduces when you confirm orders
- Stock restores if you cancel confirmed orders
- All changes are logged in order notes
- No manual intervention required

## Technical Implementation

### Backend Controllers
- **`inventoryController.js`** - Complete inventory management
- **`vendorOrderController.js`** - Enhanced with auto stock reduction

### Frontend State Management
- **Real-time data fetching** with error handling
- **Optimistic updates** for better UX
- **Loading states** and error boundaries

### Security & Validation
- **Vendor-only access** with authentication middleware
- **Input validation** for stock quantities and thresholds
- **Product ownership verification** before updates

## Future Enhancements

### Potential Additions:
- **Stock movement notifications** (email/SMS alerts)
- **Reorder point calculations** based on sales velocity
- **Supplier integration** for automatic reordering
- **Advanced analytics** and reporting
- **Barcode scanning** for mobile stock updates
- **Multi-location inventory** support

## Installation & Setup

1. **Backend**: Routes automatically registered in `server.js`
2. **Frontend**: Components integrated in existing vendor layout
3. **Database**: Product model enhanced with new fields
4. **Navigation**: Inventory link added to vendor sidebar

The system is fully integrated and ready to use with existing vendor authentication and product management systems.