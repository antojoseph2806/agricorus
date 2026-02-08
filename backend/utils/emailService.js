const nodemailer = require('nodemailer');

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

class EmailService {
  /**
   * Send low stock alert email to vendor
   */
  static async sendLowStockAlert(vendorEmail, vendorName, product) {
    try {
      const mailOptions = {
        from: `"AgriCorus Marketplace" <${process.env.EMAIL_USER}>`,
        to: vendorEmail,
        subject: `⚠️ Low Stock Alert: ${product.name}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
              .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .product-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .detail-label { font-weight: bold; color: #6b7280; }
              .detail-value { color: #111827; }
              .stock-critical { color: #dc2626; font-weight: bold; font-size: 1.2em; }
              .button { display: inline-block; background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ Low Stock Alert</h1>
                <p>Immediate attention required</p>
              </div>
              
              <div class="content">
                <p>Dear ${vendorName},</p>
                
                <div class="alert-box">
                  <strong>⚠️ Stock Alert:</strong> Your product inventory is running low and needs immediate restocking.
                </div>
                
                <div class="product-details">
                  <h2 style="margin-top: 0; color: #16a34a;">Product Details</h2>
                  
                  <div class="detail-row">
                    <span class="detail-label">Product Name:</span>
                    <span class="detail-value">${product.name}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="detail-label">Category:</span>
                    <span class="detail-value">${product.category || 'N/A'}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="detail-label">Current Stock:</span>
                    <span class="stock-critical">${product.stock} units</span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="detail-label">Alert Threshold:</span>
                    <span class="detail-value">${product.lowStockThreshold || 10} units</span>
                  </div>
                  
                  <div class="detail-row" style="border-bottom: none;">
                    <span class="detail-label">Price per Unit:</span>
                    <span class="detail-value">₹${product.price}</span>
                  </div>
                </div>
                
                <p><strong>Action Required:</strong></p>
                <ul>
                  <li>Review your inventory levels</li>
                  <li>Restock the product to avoid going out of stock</li>
                  <li>Update stock quantities in your vendor panel</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendor/inventory" class="button">
                    Update Inventory Now
                  </a>
                </div>
                
                <p style="margin-top: 30px; font-size: 0.9em; color: #6b7280;">
                  <strong>Note:</strong> Running out of stock may result in lost sales and reduced visibility in the marketplace. 
                  Keep your inventory updated to maintain customer satisfaction.
                </p>
              </div>
              
              <div class="footer">
                <p>This is an automated alert from AgriCorus Marketplace</p>
                <p>© ${new Date().getFullYear()} AgriCorus. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Low stock alert email sent to ${vendorEmail}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending low stock alert email:', error);
      throw error;
    }
  }

  /**
   * Send out of stock alert email to vendor
   */
  static async sendOutOfStockAlert(vendorEmail, vendorName, product) {
    try {
      const mailOptions = {
        from: `"AgriCorus Marketplace" <${process.env.EMAIL_USER}>`,
        to: vendorEmail,
        subject: `🚨 URGENT: ${product.name} is Out of Stock`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
              .alert-box { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .product-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .detail-label { font-weight: bold; color: #6b7280; }
              .detail-value { color: #111827; }
              .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.9em; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚨 OUT OF STOCK</h1>
                <p>Urgent Action Required</p>
              </div>
              
              <div class="content">
                <p>Dear ${vendorName},</p>
                
                <div class="alert-box">
                  <strong>🚨 CRITICAL ALERT:</strong> Your product is now completely out of stock and unavailable for purchase!
                </div>
                
                <div class="product-details">
                  <h2 style="margin-top: 0; color: #dc2626;">Product Details</h2>
                  
                  <div class="detail-row">
                    <span class="detail-label">Product Name:</span>
                    <span class="detail-value">${product.name}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="detail-label">Category:</span>
                    <span class="detail-value">${product.category || 'N/A'}</span>
                  </div>
                  
                  <div class="detail-row" style="border-bottom: none;">
                    <span class="detail-label">Current Stock:</span>
                    <span style="color: #dc2626; font-weight: bold; font-size: 1.2em;">0 units (OUT OF STOCK)</span>
                  </div>
                </div>
                
                <p><strong>Immediate Actions Required:</strong></p>
                <ul>
                  <li>🔴 Product is now hidden from marketplace</li>
                  <li>📦 Restock immediately to resume sales</li>
                  <li>💰 You are losing potential revenue</li>
                  <li>📊 Update inventory as soon as stock arrives</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendor/inventory" class="button">
                    Restock Now
                  </a>
                </div>
                
                <p style="margin-top: 30px; font-size: 0.9em; color: #6b7280;">
                  <strong>Impact:</strong> Out of stock products cannot be purchased by customers and may affect your seller rating. 
                  Please restock as soon as possible to maintain your marketplace presence.
                </p>
              </div>
              
              <div class="footer">
                <p>This is an automated critical alert from AgriCorus Marketplace</p>
                <p>© ${new Date().getFullYear()} AgriCorus. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Out of stock alert email sent to ${vendorEmail}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending out of stock alert email:', error);
      throw error;
    }
  }

  /**
   * Test email configuration
   */
  static async testConnection() {
    try {
      await transporter.verify();
      console.log('Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('Email service configuration error:', error);
      return false;
    }
  }
}

module.exports = EmailService;
