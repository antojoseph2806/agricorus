const PDFDocument = require("pdfkit");

async function generateInvoicePDF(order, buyer) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 40, bottom: 40, left: 50, right: 50 },
        info: {
          Title: `Invoice - ${order.orderNumber}`,
          Author: 'AgriCorus Marketplace',
          Subject: 'Purchase Invoice',
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Helper functions
      const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const primaryColor = '#10B981';
      const darkColor = '#1F2937';
      const grayColor = '#6B7280';

      // Header Background
      doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);

      // Company Logo/Name
      doc.fillColor('#FFFFFF').fontSize(28).font('Helvetica-Bold')
         .text('AGRICORUS', 50, 35);
      doc.fontSize(10).font('Helvetica')
         .text('Agricultural Marketplace', 50, 65)
         .text('www.agricorus.com | support@agricorus.com', 50, 80);

      // Invoice Title
      doc.fontSize(24).font('Helvetica-Bold')
         .text('TAX INVOICE', doc.page.width - 200, 40, { width: 150, align: 'right' });
      
      const invoiceNumber = `INV-${order.orderNumber?.replace('ORD-', '') || order._id.toString().slice(-10).toUpperCase()}`;
      doc.fontSize(10).font('Helvetica')
         .text(`Invoice No: ${invoiceNumber}`, doc.page.width - 200, 70, { width: 150, align: 'right' })
         .text(`Date: ${formatDate(order.deliveredAt || order.createdAt)}`, doc.page.width - 200, 85, { width: 150, align: 'right' });

      doc.y = 140;

      // Billing & Shipping Details
      const detailsY = doc.y + 10;
      
      // Billing To
      doc.fillColor(darkColor).fontSize(11).font('Helvetica-Bold')
         .text('BILL TO:', 50, detailsY);
      doc.fillColor(grayColor).fontSize(10).font('Helvetica')
         .text(buyer?.name || 'Customer', 50, detailsY + 18)
         .text(buyer?.email || '', 50, detailsY + 33)
         .text(`Role: ${order.buyerRole?.charAt(0).toUpperCase() + order.buyerRole?.slice(1) || 'Buyer'}`, 50, detailsY + 48);

      // Ship To
      doc.fillColor(darkColor).fontSize(11).font('Helvetica-Bold')
         .text('SHIP TO:', 300, detailsY);
      doc.fillColor(grayColor).fontSize(10).font('Helvetica')
         .text(order.deliveryAddress?.street || '', 300, detailsY + 18)
         .text(`${order.deliveryAddress?.district || ''}, ${order.deliveryAddress?.state || ''}`, 300, detailsY + 33)
         .text(`Pincode: ${order.deliveryAddress?.pincode || ''}`, 300, detailsY + 48);

      // Order Details
      doc.fillColor(darkColor).fontSize(11).font('Helvetica-Bold')
         .text('ORDER DETAILS:', 50, detailsY + 80);
      doc.fillColor(grayColor).fontSize(10).font('Helvetica')
         .text(`Order No: ${order.orderNumber}`, 50, detailsY + 98)
         .text(`Order Date: ${formatDate(order.createdAt)}`, 50, detailsY + 113)
         .text(`Delivered: ${order.deliveredAt ? formatDate(order.deliveredAt) : 'N/A'}`, 50, detailsY + 128)
         .text(`Payment: ${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}`, 300, detailsY + 98);

      doc.y = detailsY + 160;

      // Items Table Header
      const tableTop = doc.y;
      doc.rect(50, tableTop, doc.page.width - 100, 30).fill('#F3F4F6');
      
      doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold');
      doc.text('#', 60, tableTop + 10, { width: 30 });
      doc.text('Product', 90, tableTop + 10, { width: 180 });
      doc.text('Vendor', 270, tableTop + 10, { width: 100 });
      doc.text('Qty', 370, tableTop + 10, { width: 40, align: 'center' });
      doc.text('Price', 410, tableTop + 10, { width: 70, align: 'right' });
      doc.text('Total', 480, tableTop + 10, { width: 70, align: 'right' });

      // Items Table Body
      let currentY = tableTop + 35;
      doc.font('Helvetica').fontSize(9);

      order.items.forEach((item, index) => {
        // Check if we need a new page
        if (currentY > doc.page.height - 150) {
          doc.addPage();
          currentY = 50;
        }

        const rowHeight = 25;
        
        // Alternate row background
        if (index % 2 === 0) {
          doc.rect(50, currentY - 5, doc.page.width - 100, rowHeight).fill('#FAFAFA');
        }

        doc.fillColor(darkColor);
        doc.text(`${index + 1}`, 60, currentY, { width: 30 });
        doc.text(item.productName || 'Product', 90, currentY, { width: 180 });
        doc.text(item.vendorId?.businessName || 'Vendor', 270, currentY, { width: 100 });
        doc.text(`${item.quantity}`, 370, currentY, { width: 40, align: 'center' });
        doc.text(formatCurrency(item.price), 410, currentY, { width: 70, align: 'right' });
        doc.text(formatCurrency(item.subtotal), 480, currentY, { width: 70, align: 'right' });

        currentY += rowHeight;
      });

      // Table bottom line
      doc.moveTo(50, currentY + 5).lineTo(doc.page.width - 50, currentY + 5).strokeColor('#E5E7EB').stroke();

      // Totals Section
      currentY += 20;
      const totalsX = 380;

      doc.fillColor(grayColor).fontSize(10).font('Helvetica');
      doc.text('Subtotal:', totalsX, currentY, { width: 70 });
      doc.text(formatCurrency(order.totalAmount), totalsX + 70, currentY, { width: 80, align: 'right' });

      currentY += 20;
      doc.text('Shipping:', totalsX, currentY, { width: 70 });
      doc.fillColor('#10B981').text('FREE', totalsX + 70, currentY, { width: 80, align: 'right' });

      currentY += 20;
      doc.text('Tax (Inclusive):', totalsX, currentY, { width: 70 });
      doc.fillColor(grayColor).text('Included', totalsX + 70, currentY, { width: 80, align: 'right' });

      // Grand Total
      currentY += 25;
      doc.rect(totalsX - 10, currentY - 5, 180, 30).fill(primaryColor);
      doc.fillColor('#FFFFFF').fontSize(12).font('Helvetica-Bold');
      doc.text('GRAND TOTAL:', totalsX, currentY + 3, { width: 80 });
      doc.text(formatCurrency(order.totalAmount), totalsX + 70, currentY + 3, { width: 80, align: 'right' });

      // Payment Status
      currentY += 50;
      const paymentStatus = order.orderStatus === 'DELIVERED' ? 'PAID' : order.paymentStatus;
      const statusColor = paymentStatus === 'PAID' ? '#10B981' : '#F59E0B';
      
      doc.rect(50, currentY, 150, 35).fillAndStroke('#F9FAFB', '#E5E7EB');
      doc.fillColor(darkColor).fontSize(10).font('Helvetica-Bold')
         .text('Payment Status:', 60, currentY + 8);
      doc.fillColor(statusColor).fontSize(11).font('Helvetica-Bold')
         .text(paymentStatus, 60, currentY + 22);

      // Terms & Notes Section
      currentY += 60;
      doc.fillColor(darkColor).fontSize(11).font('Helvetica-Bold')
         .text('Terms & Conditions:', 50, currentY);
      doc.fillColor(grayColor).fontSize(9).font('Helvetica');
      currentY += 18;
      doc.text('1. This invoice is computer generated and does not require a signature.', 50, currentY, { width: 500 });
      currentY += 14;
      doc.text('2. Goods once sold will not be taken back or exchanged after the return period.', 50, currentY, { width: 500 });
      currentY += 14;
      doc.text('3. All disputes are subject to the jurisdiction of courts in the delivery location.', 50, currentY, { width: 500 });
      currentY += 14;
      doc.text('4. Please retain this invoice for warranty claims and future reference.', 50, currentY, { width: 500 });

      // Footer
      const footerY = doc.page.height - 60;
      doc.rect(0, footerY, doc.page.width, 60).fill('#F3F4F6');
      
      doc.fillColor(grayColor).fontSize(9).font('Helvetica')
         .text('Thank you for shopping with AgriCorus Marketplace!', 50, footerY + 15, { align: 'center', width: doc.page.width - 100 });
      doc.fontSize(8)
         .text('For support: support@agricorus.com | www.agricorus.com', 50, footerY + 30, { align: 'center', width: doc.page.width - 100 });
      doc.text(`Invoice generated on ${formatDate(new Date())}`, 50, footerY + 42, { align: 'center', width: doc.page.width - 100 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = generateInvoicePDF;
