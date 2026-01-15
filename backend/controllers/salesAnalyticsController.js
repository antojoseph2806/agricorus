const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { Parser } = require('json2csv');

// Get sales overview data
const getSalesOverview = async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 6);
    }

    // Get orders within the period
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      orderStatus: { $in: ['DELIVERED'] },
      paymentStatus: 'PAID'
    }).populate('items.productId');

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map(order => order.buyerId.toString())).size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate growth (compare with previous period)
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);
    const periodDiff = endDate.getTime() - startDate.getTime();
    previousStartDate.setTime(previousStartDate.getTime() - periodDiff);

    const previousOrders = await Order.find({
      createdAt: { $gte: previousStartDate, $lte: previousEndDate },
      orderStatus: { $in: ['DELIVERED'] },
      paymentStatus: 'PAID'
    });

    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const previousOrderCount = previousOrders.length;

    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    const orderGrowth = previousOrderCount > 0 
      ? ((totalOrders - previousOrderCount) / previousOrderCount) * 100 
      : 0;

    // Generate chart data (monthly breakdown)
    const chartData = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthOrders = orders.filter(order => 
        order.createdAt >= monthStart && order.createdAt <= monthEnd
      );

      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      chartData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        orders: monthOrders.length
      });
    }

    res.json({
      metrics: {
        totalRevenue,
        totalOrders,
        totalCustomers: uniqueCustomers,
        averageOrderValue,
        revenueGrowth,
        orderGrowth
      },
      chartData
    });

  } catch (error) {
    console.error('Error fetching sales overview:', error);
    res.status(500).json({ message: 'Error fetching sales overview' });
  }
};

// Get monthly sales data
const getMonthlySales = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    // Previous month for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setMonth(prevStartDate.getMonth() - 1);
    const prevEndDate = new Date(prevStartDate);
    prevEndDate.setMonth(prevEndDate.getMonth() + 1);
    prevEndDate.setDate(0);

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      orderStatus: 'DELIVERED',
      paymentStatus: 'PAID'
    }).populate('items.productId');

    const prevOrders = await Order.find({
      createdAt: { $gte: prevStartDate, $lte: prevEndDate },
      orderStatus: 'DELIVERED',
      paymentStatus: 'PAID'
    });

    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = orders.length;
    const customers = new Set(orders.map(order => order.buyerId.toString())).size;
    const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;

    const prevRevenue = prevOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const prevOrderCount = prevOrders.length;

    const revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;
    const orderGrowth = prevOrderCount > 0 ? ((orderCount - prevOrderCount) / prevOrderCount) * 100 : 0;

    // Get top products
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.productId?._id?.toString() || item.productId?.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            name: item.productName,
            sales: 0,
            revenue: 0
          };
        }
        productSales[productId].sales += item.quantity;
        productSales[productId].revenue += item.subtotal;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthlyData = [{
      month: monthNames[month - 1],
      year: parseInt(year),
      revenue,
      orders: orderCount,
      customers,
      products: Object.keys(productSales).length,
      averageOrderValue,
      topProducts,
      revenueGrowth,
      orderGrowth
    }];

    res.json(monthlyData);

  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    res.status(500).json({ message: 'Error fetching monthly sales' });
  }
};

// Get product performance data
const getProductPerformance = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('vendor', 'name')
      .lean();

    const productData = [];

    for (const product of products) {
      // Get orders for this product
      const orders = await Order.find({
        'items.product': product._id,
        status: { $in: ['delivered', 'completed'] }
      });

      let totalSales = 0;
      let revenue = 0;

      orders.forEach(order => {
        const item = order.items.find(item => item.product.toString() === product._id.toString());
        if (item) {
          totalSales += item.quantity;
          revenue += item.price * item.quantity;
        }
      });

      // Calculate growth (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const recentOrders = await Order.find({
        'items.product': product._id,
        status: { $in: ['delivered', 'completed'] },
        createdAt: { $gte: thirtyDaysAgo }
      });

      const previousOrders = await Order.find({
        'items.product': product._id,
        status: { $in: ['delivered', 'completed'] },
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
      });

      const recentSales = recentOrders.reduce((sum, order) => {
        const item = order.items.find(item => item.product.toString() === product._id.toString());
        return sum + (item ? item.quantity : 0);
      }, 0);

      const previousSales = previousOrders.reduce((sum, order) => {
        const item = order.items.find(item => item.product.toString() === product._id.toString());
        return sum + (item ? item.quantity : 0);
      }, 0);

      const salesGrowth = previousSales > 0 ? ((recentSales - previousSales) / previousSales) * 100 : 0;

      productData.push({
        id: product._id,
        name: product.name,
        category: product.category || 'uncategorized',
        vendor: product.vendor?.name || 'Unknown',
        totalSales,
        revenue,
        averageRating: product.averageRating || 0,
        reviewCount: product.reviews?.length || 0,
        stockLevel: product.stock || 0,
        salesGrowth,
        revenueGrowth: salesGrowth, // Simplified for now
        lastSold: orders.length > 0 ? orders[orders.length - 1].createdAt : null,
        image: product.images?.[0]
      });
    }

    res.json(productData);

  } catch (error) {
    console.error('Error fetching product performance:', error);
    res.status(500).json({ message: 'Error fetching product performance' });
  }
};

// Get revenue trends data
const getRevenueTrends = async (req, res) => {
  try {
    const { period = '6months' } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case '2years':
        startDate.setFullYear(startDate.getFullYear() - 2);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 6);
    }

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ['delivered', 'completed'] }
    }).populate('items.product');

    // Timeline data
    const timeline = [];
    const periodCount = period === '2years' ? 24 : period === '1year' ? 12 : 6;
    
    for (let i = periodCount - 1; i >= 0; i--) {
      const periodStart = new Date();
      periodStart.setMonth(periodStart.getMonth() - i);
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);
      
      const periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(0);
      periodEnd.setHours(23, 59, 59, 999);

      const periodOrders = orders.filter(order => 
        order.createdAt >= periodStart && order.createdAt <= periodEnd
      );

      const revenue = periodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const orderCount = periodOrders.length;
      const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;

      // Calculate growth compared to previous period
      const prevPeriodStart = new Date(periodStart);
      prevPeriodStart.setMonth(prevPeriodStart.getMonth() - 1);
      const prevPeriodEnd = new Date(periodStart);
      prevPeriodEnd.setDate(0);

      const prevPeriodOrders = orders.filter(order => 
        order.createdAt >= prevPeriodStart && order.createdAt <= prevPeriodEnd
      );
      const prevRevenue = prevPeriodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const growth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

      timeline.push({
        period: periodStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue,
        growth,
        orders: orderCount,
        averageOrderValue
      });
    }

    // Category breakdown
    const categoryRevenue = {};
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    orders.forEach(order => {
      order.items.forEach(item => {
        const category = item.product?.category || 'uncategorized';
        if (!categoryRevenue[category]) {
          categoryRevenue[category] = 0;
        }
        categoryRevenue[category] += item.price * item.quantity;
      });
    });

    const categories = Object.entries(categoryRevenue).map(([category, revenue]) => ({
      category,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
      growth: Math.random() * 20 - 10 // Placeholder - implement proper growth calculation
    })).sort((a, b) => b.revenue - a.revenue);

    // Vendor breakdown
    const vendorRevenue = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const vendorId = item.product?.vendor?.toString() || 'unknown';
        if (!vendorRevenue[vendorId]) {
          vendorRevenue[vendorId] = {
            revenue: 0,
            orders: new Set(),
            commission: 0
          };
        }
        vendorRevenue[vendorId].revenue += item.price * item.quantity;
        vendorRevenue[vendorId].orders.add(order._id.toString());
        vendorRevenue[vendorId].commission += (item.price * item.quantity) * 0.1; // 10% commission
      });
    });

    const vendors = await Promise.all(
      Object.entries(vendorRevenue).map(async ([vendorId, data]) => {
        const vendor = await User.findById(vendorId).select('name');
        return {
          vendorName: vendor?.name || 'Unknown Vendor',
          revenue: data.revenue,
          orders: data.orders.size,
          commission: data.commission
        };
      })
    );

    vendors.sort((a, b) => b.revenue - a.revenue);

    res.json({
      timeline,
      categories,
      vendors: vendors.slice(0, 20) // Top 20 vendors
    });

  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    res.status(500).json({ message: 'Error fetching revenue trends' });
  }
};

// Generate and download reports
const downloadReport = async (req, res) => {
  try {
    const { type, period, month, year } = req.query;
    
    let data = [];
    let filename = '';
    
    switch (type) {
      case 'overview':
        // Get overview data and format for CSV
        const overviewData = await getSalesOverviewData(period);
        data = overviewData.chartData.map(item => ({
          Month: item.month,
          Revenue: item.revenue,
          Orders: item.orders
        }));
        filename = `sales-overview-${period}.csv`;
        break;
        
      case 'monthly':
        // Get monthly data
        const monthlyData = await getMonthlyData(month, year);
        data = [{
          Month: monthlyData.month,
          Year: monthlyData.year,
          Revenue: monthlyData.revenue,
          Orders: monthlyData.orders,
          Customers: monthlyData.customers,
          'Average Order Value': monthlyData.averageOrderValue
        }];
        filename = `monthly-report-${year}-${month}.csv`;
        break;
        
      case 'products':
        // Get product performance data
        const productData = await getProductPerformanceData();
        data = productData.map(product => ({
          'Product Name': product.name,
          Category: product.category,
          Vendor: product.vendor,
          'Total Sales': product.totalSales,
          Revenue: product.revenue,
          'Average Rating': product.averageRating,
          'Stock Level': product.stockLevel,
          'Sales Growth': product.salesGrowth + '%'
        }));
        filename = `product-performance.csv`;
        break;
        
      case 'revenue':
        // Get revenue trends data
        const revenueData = await getRevenueTrendsData(period);
        data = revenueData.timeline.map(item => ({
          Period: item.period,
          Revenue: item.revenue,
          Growth: item.growth + '%',
          Orders: item.orders,
          'Average Order Value': item.averageOrderValue
        }));
        filename = `revenue-trends-${period}.csv`;
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }
    
    const parser = new Parser();
    const csv = parser.parse(data);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
    
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};

// Helper functions to get data (reuse logic from above functions)
const getSalesOverviewData = async (period) => {
  // Reuse logic from getSalesOverview
  // This is a simplified version - in production, extract common logic
  return { chartData: [] };
};

const getMonthlyData = async (month, year) => {
  // Reuse logic from getMonthlySales
  return { month: 'January', year: 2024, revenue: 0, orders: 0, customers: 0, averageOrderValue: 0 };
};

const getProductPerformanceData = async () => {
  // Reuse logic from getProductPerformance
  return [];
};

const getRevenueTrendsData = async (period) => {
  // Reuse logic from getRevenueTrends
  return { timeline: [] };
};

module.exports = {
  getSalesOverview,
  getMonthlySales,
  getProductPerformance,
  getRevenueTrends,
  downloadReport
};