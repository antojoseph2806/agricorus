require('dotenv').config();

module.exports = {
  // Base URLs
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api',

  // Test User Credentials
  landowner: {
    email: process.env.LANDOWNER_EMAIL || 'landowner@test.com',
    password: process.env.LANDOWNER_PASSWORD || 'Test@123',
    name: process.env.LANDOWNER_NAME || 'Test Landowner',
    phone: process.env.LANDOWNER_PHONE || '9876543210',
    role: 'landowner'
  },

  farmer: {
    email: process.env.FARMER_EMAIL || 'farmer@test.com',
    password: process.env.FARMER_PASSWORD || 'Test@123',
    name: process.env.FARMER_NAME || 'Test Farmer',
    phone: process.env.FARMER_PHONE || '9876543211',
    role: 'farmer'
  },

  vendor: {
    email: process.env.VENDOR_EMAIL || 'vendor@test.com',
    password: process.env.VENDOR_PASSWORD || 'Test@123',
    businessName: process.env.VENDOR_BUSINESS_NAME || 'Test Vendor Business',
    ownerName: process.env.VENDOR_OWNER_NAME || 'Test Vendor Owner',
    phone: process.env.VENDOR_PHONE || '9876543212',
    role: 'vendor'
  },

  // Browser Configuration
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS === 'true',
  implicitWait: parseInt(process.env.IMPLICIT_WAIT) || 10000,
  explicitWait: parseInt(process.env.EXPLICIT_WAIT) || 30000,

  // Screenshot Configuration
  screenshotOnFailure: process.env.SCREENSHOT_ON_FAILURE !== 'false',
  screenshotDir: process.env.SCREENSHOT_DIR || './screenshots',

  // Test Data
  testLand: {
    title: process.env.TEST_LAND_TITLE || 'Test Agricultural Land',
    sizeInAcres: parseFloat(process.env.TEST_LAND_SIZE) || 5.5,
    leasePricePerMonth: parseInt(process.env.TEST_LAND_PRICE) || 15000,
    leaseDurationMonths: parseInt(process.env.TEST_LAND_DURATION) || 12,
    soilType: 'Loamy',
    waterSource: 'Borewell',
    accessibility: 'Good Road Access',
    location: {
      address: '123 Farm Road, Test Village, Test District',
      latitude: 12.9716,
      longitude: 77.5946
    }
  },

  testProject: {
    title: 'Test Organic Farming Project',
    description: 'A comprehensive organic farming initiative focusing on sustainable agriculture practices and high-yield crop production.',
    cropType: 'Tomatoes',
    fundingGoal: 50000,
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
    farmerVerification: {
      aadhaarNumber: '123456789012',
      govtIdType: 'AADHAAR',
      govtIdNumber: '123456789012'
    },
    landDetails: {
      state: 'Karnataka',
      district: 'Bangalore Rural',
      tehsil: 'Devanahalli',
      village: 'Chikkajala',
      panchayat: 'Chikkajala Gram Panchayat',
      pincode: '562110',
      surveyNumber: '123/4A',
      landAreaValue: 2.5,
      landAreaUnit: 'ACRE',
      landType: 'AGRICULTURAL',
      latitude: 13.1986,
      longitude: 77.7066
    }
  },

  // Timeouts
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 20000,
    veryLong: 30000
  }
};
