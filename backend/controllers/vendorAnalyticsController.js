const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const sendResponse = (res, success, message, data = null, statusCode = 200) => {
  res.status(statusCode).json({ success, message, data });
};

/**
 * Get sales metrics for dashboard
 */
exports.getSalesMetrics = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - days * 2);
    const previousEndDate = new Date();
    previousEndDate.setDate(previousEndDate.getDate() - days);

    const vendorProducts = await Product.find({ vendorId: vendorId }).select('_id');

    const currentOrders = await Order.find({
      'items.vendorId': vendorId,
      createdAt: { $gte: startDate },
    });

    const previousOrders = await Order.find({
      'items.vendorId': vendorId,
      createdAt: { $gte: previousStartDate, $lt: previousEndDate },
    });

    let totalRevenue = 0;
    let totalOrders = 0;
    const customerSet = new Set();
    const orderIds = new Set();

    currentOrders.forEach((order) => {
      let hasVendorItem = false;
      order.items.forEach((item) => {
        if (item.vendorId && item.vendorId.toString() === vendorId.toString()) {
          totalRevenue += item.subtotal || item.price * item.quantity;
          hasVendorItem = true;
        }
      });
      if (hasVendorItem) {
        orderIds.add(order._id.toString());
        if (order.buyerId) customerSet.add(order.buyerId.toString());
      }
    });
    totalOrders = orderIds.size;

    let prevRevenue = 0;
    let prevOrders = 0;
    const prevOrderIds = new Set();

    previousOrders.forEach((order) => {
      let hasVendorItem = false;
      order.items.forEach((item) => {
        if (item.vendorId && item.vendorId.toString() === vendorId.toString()) {
          prevRevenue += item.subtotal || item.price * item.quantity;
          hasVendorItem = true;
        }
      });
      if (hasVendorItem) {
        prevOrderIds.add(order._id.toString());
      }
    });
    prevOrders = prevOrderIds.size;

    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : totalRevenue > 0 ? 100 : 0;
    const ordersGrowth = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : totalOrders > 0 ? 100 : 0;

    const metrics = {
      totalRevenue,
      totalOrders,
      totalProducts: vendorProducts.length,
      totalCustomers: customerSet.size,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      ordersGrowth: Math.round(ordersGrowth * 10) / 10,
      averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      conversionRate: 0,
    };

    sendResponse(res, true, 'Metrics fetched successfully', metrics);
  } catch (error) {
    console.error('Get sales metrics error:', error);
    sendResponse(res, false, 'Failed to fetch metrics', null, 500);
  }
};


/**
 * Get chart data for revenue and orders trends
 */
exports.getChartData = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { period = '30' } = req.query;
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await Order.find({
      'items.vendorId': vendorId,
      createdAt: { $gte: startDate },
    }).sort({ createdAt: 1 });

    const dataByDate = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateKey = date.toISOString().split('T')[0];
      dataByDate[dateKey] = { revenue: 0, orders: 0 };
    }

    const processedOrders = new Set();
    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!dataByDate[dateKey]) {
        dataByDate[dateKey] = { revenue: 0, orders: 0 };
      }

      let orderHasVendorItem = false;
      order.items.forEach((item) => {
        if (item.vendorId && item.vendorId.toString() === vendorId.toString()) {
          dataByDate[dateKey].revenue += item.subtotal || item.price * item.quantity;
          orderHasVendorItem = true;
        }
      });

      if (orderHasVendorItem && !processedOrders.has(order._id.toString())) {
        dataByDate[dateKey].orders++;
        processedOrders.add(order._id.toString());
      }
    });

    const labels = Object.keys(dataByDate).sort();
    const revenue = labels.map((date) => dataByDate[date].revenue);
    const ordersData = labels.map((date) => dataByDate[date].orders);

    sendResponse(res, true, 'Chart data fetched successfully', {
      labels: labels.map((d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })),
      revenue,
      orders: ordersData,
    });
  } catch (error) {
    console.error('Get chart data error:', error);
    sendResponse(res, false, 'Failed to fetch chart data', null, 500);
  }
};


/**
 * Get top performing products
 */
exports.getTopProducts = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { limit = 5 } = req.query;

    const vendorProducts = await Product.find({ vendorId: vendorId }).select('_id name images');

    const productSales = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.vendorId': new mongoose.Types.ObjectId(vendorId) } },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: parseInt(limit) },
    ]);

    const topProducts = productSales.map((sale) => {
      const product = vendorProducts.find((p) => p._id.equals(sale._id));
      return {
        _id: sale._id,
        name: product?.name || 'Unknown Product',
        images: product?.images || [],
        totalSold: sale.totalSold,
        revenue: sale.revenue,
      };
    });

    sendResponse(res, true, 'Top products fetched successfully', topProducts);
  } catch (error) {
    console.error('Get top products error:', error);
    sendResponse(res, false, 'Failed to fetch top products', null, 500);
  }
};

/**
 * Get recent orders
 */
exports.getRecentOrders = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { limit = 5 } = req.query;

    const orders = await Order.find({ 'items.vendorId': vendorId })
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const recentOrders = orders.map((order) => {
      let orderTotal = 0;
      order.items.forEach((item) => {
        if (item.vendorId && item.vendorId.toString() === vendorId.toString()) {
          orderTotal += item.subtotal || item.price * item.quantity;
        }
      });
      return {
        _id: order._id,
        orderNumber: order.orderNumber || order._id.toString().slice(-8).toUpperCase(),
        buyerName: order.buyerId?.name || 'Guest',
        total: orderTotal,
        status: order.orderStatus,
        createdAt: order.createdAt,
      };
    });

    sendResponse(res, true, 'Recent orders fetched successfully', recentOrders);
  } catch (error) {
    console.error('Get recent orders error:', error);
    sendResponse(res, false, 'Failed to fetch recent orders', null, 500);
  }
};


/**
 * Helper function to get monthly report data
 */
async function getMonthlyReportData(vendorId, month, year) {
  const targetMonth = parseInt(month) - 1;
  const targetYear = parseInt(year);

  const startDate = new Date(targetYear, targetMonth, 1);
  const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

  const prevStartDate = new Date(targetYear, targetMonth - 1, 1);
  const prevEndDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

  const vendorProducts = await Product.find({ vendorId: vendorId }).select('_id name');

  const currentOrders = await Order.find({
    'items.vendorId': vendorId,
    createdAt: { $gte: startDate, $lte: endDate },
  }).populate('buyerId', 'name');

  const prevOrders = await Order.find({
    'items.vendorId': vendorId,
    createdAt: { $gte: prevStartDate, $lte: prevEndDate },
  });

  let revenue = 0, prevRevenue = 0;
  const customerSet = new Set(), prevCustomerSet = new Set();
  const productSales = {};
  const orderIds = new Set();

  currentOrders.forEach((order) => {
    let hasVendorItem = false;
    if (order.buyerId) customerSet.add(order.buyerId._id.toString());
    order.items.forEach((item) => {
      if (item.vendorId && item.vendorId.toString() === vendorId.toString()) {
        const amount = item.subtotal || item.price * item.quantity;
        revenue += amount;
        hasVendorItem = true;
        const prodId = item.productId.toString();
        if (!productSales[prodId]) productSales[prodId] = { sold: 0, revenue: 0 };
        productSales[prodId].sold += item.quantity;
        productSales[prodId].revenue += amount;
      }
    });
    if (hasVendorItem) orderIds.add(order._id.toString());
  });

  const prevOrderIds = new Set();
  prevOrders.forEach((order) => {
    let hasVendorItem = false;
    if (order.buyerId) prevCustomerSet.add(order.buyerId.toString());
    order.items.forEach((item) => {
      if (item.vendorId && item.vendorId.toString() === vendorId.toString()) {
        prevRevenue += item.subtotal || item.price * item.quantity;
        hasVendorItem = true;
      }
    });
    if (hasVendorItem) prevOrderIds.add(order._id.toString());
  });

  const topProducts = Object.entries(productSales)
    .map(([prodId, data]) => {
      const product = vendorProducts.find((p) => p._id.toString() === prodId);
      return { name: product?.name || 'Unknown', sold: data.sold, revenue: data.revenue };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const totalOrders = orderIds.size;
  const prevTotalOrders = prevOrderIds.size;

  return {
    month: months[targetMonth],
    year: targetYear,
    revenue,
    orders: totalOrders,
    customers: customerSet.size,
    averageOrderValue: totalOrders > 0 ? Math.round(revenue / totalOrders) : 0,
    topProducts,
    revenueGrowth: prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 1000) / 10 : revenue > 0 ? 100 : 0,
    ordersGrowth: prevTotalOrders > 0 ? Math.round(((totalOrders - prevTotalOrders) / prevTotalOrders) * 1000) / 10 : totalOrders > 0 ? 100 : 0,
    customersGrowth: prevCustomerSet.size > 0 ? Math.round(((customerSet.size - prevCustomerSet.size) / prevCustomerSet.size) * 1000) / 10 : customerSet.size > 0 ? 100 : 0,
  };
}

/**
 * Get monthly report data
 */
exports.getMonthlyReport = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { month, year } = req.query;
    const data = await getMonthlyReportData(vendorId, month, year);
    sendResponse(res, true, 'Monthly report fetched successfully', data);
  } catch (error) {
    console.error('Get monthly report error:', error);
    sendResponse(res, false, 'Failed to fetch monthly report', null, 500);
  }
};


/**
 * Download monthly report as PDF or Excel
 */
exports.downloadMonthlyReport = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { month, year, format = 'pdf' } = req.query;
    const vendorName = req.vendor.businessName || req.vendor.name || 'Vendor';

    const data = await getMonthlyReportData(vendorId, month, year);

    if (format === 'excel') {
      // Generate Excel
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'AgriCorus';
      workbook.created = new Date();

      const sheet = workbook.addWorksheet('Monthly Report');

      // Title
      sheet.mergeCells('A1:D1');
      sheet.getCell('A1').value = `Monthly Sales Report - ${data.month} ${data.year}`;
      sheet.getCell('A1').font = { size: 18, bold: true };
      sheet.getCell('A1').alignment = { horizontal: 'center' };

      // Vendor info
      sheet.mergeCells('A2:D2');
      sheet.getCell('A2').value = `Vendor: ${vendorName}`;
      sheet.getCell('A2').font = { size: 12 };

      // Summary section
      sheet.getCell('A4').value = 'Summary';
      sheet.getCell('A4').font = { size: 14, bold: true };

      const summaryData = [
        ['Metric', 'Value', 'Growth'],
        ['Total Revenue', `₹${data.revenue.toLocaleString('en-IN')}`, `${data.revenueGrowth}%`],
        ['Total Orders', data.orders, `${data.ordersGrowth}%`],
        ['New Customers', data.customers, `${data.customersGrowth}%`],
        ['Average Order Value', `₹${data.averageOrderValue.toLocaleString('en-IN')}`, '-'],
      ];

      summaryData.forEach((row, index) => {
        const rowNum = 5 + index;
        sheet.getRow(rowNum).values = row;
        if (index === 0) {
          sheet.getRow(rowNum).font = { bold: true };
          sheet.getRow(rowNum).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
        }
      });

      // Top Products section
      sheet.getCell('A12').value = 'Top Products';
      sheet.getCell('A12').font = { size: 14, bold: true };

      const productHeaders = ['Rank', 'Product Name', 'Units Sold', 'Revenue'];
      sheet.getRow(13).values = productHeaders;
      sheet.getRow(13).font = { bold: true };
      sheet.getRow(13).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

      data.topProducts.forEach((product, index) => {
        sheet.getRow(14 + index).values = [
          index + 1,
          product.name,
          product.sold,
          `₹${product.revenue.toLocaleString('en-IN')}`,
        ];
      });

      // Set column widths
      sheet.columns = [
        { width: 20 },
        { width: 30 },
        { width: 15 },
        { width: 20 },
      ];

      // Generate buffer and send
      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=monthly-report-${data.year}-${month.toString().padStart(2, '0')}.xlsx`);
      res.send(buffer);
    } else {
      // Generate PDF
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=monthly-report-${data.year}-${month.toString().padStart(2, '0')}.pdf`);

      doc.pipe(res);

      // Title
      doc.fontSize(24).font('Helvetica-Bold').text(`Monthly Sales Report`, { align: 'center' });
      doc.fontSize(16).font('Helvetica').text(`${data.month} ${data.year}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Vendor: ${vendorName}`, { align: 'center' });
      doc.moveDown(2);

      // Summary
      doc.fontSize(16).font('Helvetica-Bold').text('Summary');
      doc.moveDown(0.5);

      const formatCurrency = (val) => `₹${val.toLocaleString('en-IN')}`;

      doc.fontSize(12).font('Helvetica');
      doc.text(`Total Revenue: ${formatCurrency(data.revenue)} (${data.revenueGrowth > 0 ? '+' : ''}${data.revenueGrowth}%)`);
      doc.text(`Total Orders: ${data.orders} (${data.ordersGrowth > 0 ? '+' : ''}${data.ordersGrowth}%)`);
      doc.text(`New Customers: ${data.customers} (${data.customersGrowth > 0 ? '+' : ''}${data.customersGrowth}%)`);
      doc.text(`Average Order Value: ${formatCurrency(data.averageOrderValue)}`);
      doc.moveDown(2);

      // Top Products
      doc.fontSize(16).font('Helvetica-Bold').text('Top Products');
      doc.moveDown(0.5);

      if (data.topProducts.length === 0) {
        doc.fontSize(12).font('Helvetica').text('No product sales this month.');
      } else {
        // Table header
        const tableTop = doc.y;
        const col1 = 50, col2 = 100, col3 = 350, col4 = 430;

        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('#', col1, tableTop);
        doc.text('Product Name', col2, tableTop);
        doc.text('Sold', col3, tableTop);
        doc.text('Revenue', col4, tableTop);

        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        doc.font('Helvetica');
        data.topProducts.forEach((product, index) => {
          const y = tableTop + 25 + index * 20;
          doc.text(`${index + 1}`, col1, y);
          doc.text(product.name.substring(0, 40), col2, y);
          doc.text(`${product.sold}`, col3, y);
          doc.text(formatCurrency(product.revenue), col4, y);
        });
      }

      // Footer
      doc.moveDown(4);
      doc.fontSize(10).fillColor('gray').text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, { align: 'center' });

      doc.end();
    }
  } catch (error) {
    console.error('Download monthly report error:', error);
    sendResponse(res, false, 'Failed to download report', null, 500);
  }
};


/**
 * Get product performance data
 */
exports.getProductPerformance = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const products = await Product.find({ vendorId: vendorId });

    const productMetrics = await Promise.all(
      products.map(async (product) => {
        const salesData = await Order.aggregate([
          { $unwind: '$items' },
          { $match: { 'items.productId': product._id } },
          {
            $group: {
              _id: null,
              totalSold: { $sum: '$items.quantity' },
              totalRevenue: { $sum: '$items.subtotal' },
            },
          },
        ]);

        const reviews = await Review.find({ productId: product._id });
        const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
        const sales = salesData[0] || { totalSold: 0, totalRevenue: 0 };

        return {
          _id: product._id,
          name: product.name,
          images: product.images,
          category: product.category || 'Uncategorized',
          price: product.price,
          stockLevel: product.stock || 0,
          totalSold: sales.totalSold,
          totalRevenue: sales.totalRevenue || 0,
          averageRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviews.length,
          views: product.views || 0,
          conversionRate: product.views > 0 ? Math.round((sales.totalSold / product.views) * 1000) / 10 : 0,
          revenueGrowth: 0,
          salesGrowth: 0,
        };
      })
    );

    sendResponse(res, true, 'Product performance fetched successfully', productMetrics);
  } catch (error) {
    console.error('Get product performance error:', error);
    sendResponse(res, false, 'Failed to fetch product performance', null, 500);
  }
};

/**
 * Generate custom report
 */
exports.generateCustomReport = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { name, dateRange, metrics, groupBy, filters, format } = req.body;
    const vendorName = req.vendor.businessName || req.vendor.name || 'Vendor';

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);

    // Fetch orders in date range
    const query = {
      'items.vendorId': vendorId,
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (filters?.status) {
      query.orderStatus = filters.status;
    }

    const orders = await Order.find(query).populate('buyerId', 'name');
    const products = await Product.find({ vendorId: vendorId });

    // Calculate metrics
    let totalRevenue = 0, totalOrders = 0, totalProducts = 0;
    const customerSet = new Set();
    const orderIds = new Set();

    orders.forEach((order) => {
      let hasVendorItem = false;
      order.items.forEach((item) => {
        if (item.vendorId && item.vendorId.toString() === vendorId.toString()) {
          totalRevenue += item.subtotal || item.price * item.quantity;
          totalProducts += item.quantity;
          hasVendorItem = true;
        }
      });
      if (hasVendorItem) {
        orderIds.add(order._id.toString());
        if (order.buyerId) customerSet.add(order.buyerId._id.toString());
      }
    });
    totalOrders = orderIds.size;

    const reportData = {
      name,
      dateRange: { start: startDate, end: endDate },
      generatedAt: new Date(),
      metrics: {
        revenue: metrics.includes('revenue') ? totalRevenue : null,
        orders: metrics.includes('orders') ? totalOrders : null,
        customers: metrics.includes('customers') ? customerSet.size : null,
        products: metrics.includes('products') ? totalProducts : null,
        averageOrderValue: metrics.includes('averageOrderValue') && totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : null,
      },
    };

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Custom Report');

      sheet.mergeCells('A1:C1');
      sheet.getCell('A1').value = name || 'Custom Report';
      sheet.getCell('A1').font = { size: 16, bold: true };

      sheet.getCell('A3').value = `Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      sheet.getCell('A4').value = `Vendor: ${vendorName}`;

      let row = 6;
      sheet.getCell(`A${row}`).value = 'Metric';
      sheet.getCell(`B${row}`).value = 'Value';
      sheet.getRow(row).font = { bold: true };

      if (reportData.metrics.revenue !== null) {
        row++;
        sheet.getCell(`A${row}`).value = 'Total Revenue';
        sheet.getCell(`B${row}`).value = `₹${reportData.metrics.revenue.toLocaleString('en-IN')}`;
      }
      if (reportData.metrics.orders !== null) {
        row++;
        sheet.getCell(`A${row}`).value = 'Total Orders';
        sheet.getCell(`B${row}`).value = reportData.metrics.orders;
      }
      if (reportData.metrics.customers !== null) {
        row++;
        sheet.getCell(`A${row}`).value = 'Total Customers';
        sheet.getCell(`B${row}`).value = reportData.metrics.customers;
      }
      if (reportData.metrics.products !== null) {
        row++;
        sheet.getCell(`A${row}`).value = 'Products Sold';
        sheet.getCell(`B${row}`).value = reportData.metrics.products;
      }
      if (reportData.metrics.averageOrderValue !== null) {
        row++;
        sheet.getCell(`A${row}`).value = 'Average Order Value';
        sheet.getCell(`B${row}`).value = `₹${reportData.metrics.averageOrderValue.toLocaleString('en-IN')}`;
      }

      sheet.columns = [{ width: 25 }, { width: 20 }];

      const buffer = await workbook.xlsx.writeBuffer();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${(name || 'custom-report').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
      res.send(buffer);
    } else if (format === 'csv') {
      let csv = 'Metric,Value\n';
      if (reportData.metrics.revenue !== null) csv += `Total Revenue,${reportData.metrics.revenue}\n`;
      if (reportData.metrics.orders !== null) csv += `Total Orders,${reportData.metrics.orders}\n`;
      if (reportData.metrics.customers !== null) csv += `Total Customers,${reportData.metrics.customers}\n`;
      if (reportData.metrics.products !== null) csv += `Products Sold,${reportData.metrics.products}\n`;
      if (reportData.metrics.averageOrderValue !== null) csv += `Average Order Value,${reportData.metrics.averageOrderValue}\n`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${(name || 'custom-report').replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
      res.send(csv);
    } else {
      // PDF
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${(name || 'custom-report').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).font('Helvetica-Bold').text(name || 'Custom Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).font('Helvetica').text(`Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, { align: 'center' });
      doc.text(`Vendor: ${vendorName}`, { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(14).font('Helvetica-Bold').text('Metrics');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica');

      if (reportData.metrics.revenue !== null) doc.text(`Total Revenue: ₹${reportData.metrics.revenue.toLocaleString('en-IN')}`);
      if (reportData.metrics.orders !== null) doc.text(`Total Orders: ${reportData.metrics.orders}`);
      if (reportData.metrics.customers !== null) doc.text(`Total Customers: ${reportData.metrics.customers}`);
      if (reportData.metrics.products !== null) doc.text(`Products Sold: ${reportData.metrics.products}`);
      if (reportData.metrics.averageOrderValue !== null) doc.text(`Average Order Value: ₹${reportData.metrics.averageOrderValue.toLocaleString('en-IN')}`);

      doc.moveDown(2);
      doc.fontSize(10).fillColor('gray').text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, { align: 'center' });

      doc.end();
    }
  } catch (error) {
    console.error('Generate custom report error:', error);
    sendResponse(res, false, 'Failed to generate report', null, 500);
  }
};


/**
 * Save report configuration
 */
exports.saveReportConfig = async (req, res) => {
  try {
    sendResponse(res, true, 'Report configuration saved', {
      _id: new mongoose.Types.ObjectId(),
      ...req.body,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Save report config error:', error);
    sendResponse(res, false, 'Failed to save configuration', null, 500);
  }
};

/**
 * Get download history
 */
exports.getDownloadHistory = async (req, res) => {
  try {
    sendResponse(res, true, 'Download history fetched', []);
  } catch (error) {
    console.error('Get download history error:', error);
    sendResponse(res, false, 'Failed to fetch download history', null, 500);
  }
};

/**
 * Download file by ID
 */
exports.downloadFile = async (req, res) => {
  try {
    sendResponse(res, false, 'File not found', null, 404);
  } catch (error) {
    console.error('Download file error:', error);
    sendResponse(res, false, 'Failed to download file', null, 500);
  }
};

/**
 * Delete report
 */
exports.deleteReport = async (req, res) => {
  try {
    sendResponse(res, true, 'Report deleted successfully');
  } catch (error) {
    console.error('Delete report error:', error);
    sendResponse(res, false, 'Failed to delete report', null, 500);
  }
};

/**
 * Generate quick report (daily/weekly/monthly)
 */
exports.generateQuickReport = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { type, format = 'pdf' } = req.body;
    const vendorName = req.vendor.businessName || req.vendor.name || 'Vendor';

    let startDate = new Date();
    let endDate = new Date();
    let reportTitle = '';

    switch (type) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        reportTitle = `Daily Report - ${startDate.toLocaleDateString('en-IN')}`;
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        reportTitle = `Weekly Report - ${startDate.toLocaleDateString('en-IN')} to ${endDate.toLocaleDateString('en-IN')}`;
        break;
      case 'monthly':
      default:
        startDate.setDate(1);
        reportTitle = `Monthly Report - ${startDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`;
        break;
    }

    const orders = await Order.find({
      'items.vendorId': vendorId,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    let totalRevenue = 0, totalOrders = 0;
    const customerSet = new Set();
    const orderIds = new Set();

    orders.forEach((order) => {
      let hasVendorItem = false;
      order.items.forEach((item) => {
        if (item.vendorId && item.vendorId.toString() === vendorId.toString()) {
          totalRevenue += item.subtotal || item.price * item.quantity;
          hasVendorItem = true;
        }
      });
      if (hasVendorItem) {
        orderIds.add(order._id.toString());
        if (order.buyerId) customerSet.add(order.buyerId.toString());
      }
    });
    totalOrders = orderIds.size;

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-report-${Date.now()}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold').text(reportTitle, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Vendor: ${vendorName}`, { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(14).font('Helvetica-Bold').text('Summary');
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    doc.text(`Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`);
    doc.text(`Total Orders: ${totalOrders}`);
    doc.text(`Unique Customers: ${customerSet.size}`);
    doc.text(`Average Order Value: ₹${totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString('en-IN') : 0}`);

    doc.moveDown(2);
    doc.fontSize(10).fillColor('gray').text(`Generated on ${new Date().toLocaleDateString('en-IN')}`, { align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Generate quick report error:', error);
    sendResponse(res, false, 'Failed to generate quick report', null, 500);
  }
};
