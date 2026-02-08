# Low Stock Email Alert Implementation

## Overview
Implemented automatic email alerts to vendors when product stock reaches or falls below the alert threshold.

## What Was Implemented

### 1. Email Service (`backend/utils/emailService.js`)
Created a new email service using nodemailer with two main functions:

- **`sendLowStockAlert()`** - Sends a warning email when stock reaches the alert threshold
  - Yellow/orange themed alert
  - Shows current stock, threshold, and product details
  - Includes "Update Inventory Now" button

- **`sendOutOfStockAlert()`** - Sends an urgent email when stock reaches zero
  - Red themed critical alert
  - Emphasizes urgency and lost revenue
  - Includes "Restock Now" button

### 2. Updated Notification Service (`backend/utils/notificationService.js`)
Enhanced existing notification methods to include email alerts:

- **`notifyLowStock()`** - Now sends both in-app notification AND email
- **`notifyOutOfStock()`** - Now sends both in-app notification AND email

### 3. Stock Monitoring Points
Added stock alert checks at all points where stock is reduced:

#### a. Manual Stock Updates (`backend/controllers/inventoryController.js`)
- Already had notification logic in place
- Triggers when vendor manually updates stock via inventory management

#### b. Order Placement (`backend/controllers/orderController.js`)
- Added stock alert checks after stock deduction
- Triggers when customers place orders

#### c. Payment Processing (`backend/controllers/marketplacePaymentController.js`)
- Added stock alert checks in TWO locations:
  - Online payment flow
  - Cash on delivery flow
- Triggers immediately after successful payment

## How It Works

1. **Stock Reduction**: When stock is reduced (order, payment, manual update)
2. **Threshold Check**: System checks if stock <= lowStockThreshold (default: 10)
3. **Notification Creation**: Creates in-app notification
4. **Email Lookup**: Fetches vendor email from database
5. **Email Sent**: Sends formatted HTML email to vendor
6. **Logging**: Logs success/failure (doesn't fail the transaction if email fails)

## Email Configuration

Uses existing .env variables:
```
EMAIL_USER=ajmwelcomemail@gmail.com
EMAIL_PASS=bedw brfs szjv wtiq
```

## Alert Triggers

### Low Stock Alert (⚠️ Warning)
- **Condition**: `stock <= lowStockThreshold AND stock > 0`
- **Priority**: MEDIUM
- **Email Theme**: Yellow/Orange
- **Example**: Stock drops from 15 to 9 units (threshold: 10)

### Out of Stock Alert (🚨 Critical)
- **Condition**: `stock === 0`
- **Priority**: HIGH
- **Email Theme**: Red
- **Example**: Stock drops from 2 to 0 units

## Email Features

Both emails include:
- Professional HTML formatting
- Product details (name, category, stock, price)
- Current stock level (highlighted)
- Alert threshold information
- Direct link to inventory management
- Responsive design
- AgriCorus branding

## Error Handling

- Email failures don't block stock updates or orders
- Errors are logged to console
- In-app notifications still work even if email fails
- Graceful degradation ensures business continuity

## Testing

To test the email alerts:

1. **Low Stock Test**:
   - Set a product's lowStockThreshold to 10
   - Reduce stock to 10 or below via inventory update
   - Check vendor email for alert

2. **Out of Stock Test**:
   - Reduce a product's stock to 0
   - Check vendor email for critical alert

3. **Order Flow Test**:
   - Place an order that reduces stock below threshold
   - Vendor should receive email after payment

## Dependencies

- `nodemailer` (already installed in package.json)
- Gmail SMTP service
- Existing Vendor and Product models

## Future Enhancements

Potential improvements:
- SMS alerts for critical stock levels
- Weekly stock summary emails
- Predictive stock alerts based on sales velocity
- Customizable alert thresholds per product
- Email preferences in vendor settings
