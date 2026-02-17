const { expect } = require('chai');
const DriverFactory = require('./utils/driver-factory-edge');
const TestHelpers = require('./utils/test-helpers');
const LoginPage = require('./pages/login-page');
const FarmerPage = require('./pages/farmer-page');
const config = require('./config/test-config');
const faker = require('faker');

describe('Farmer CRUD Operations - Complete Test Suite', function() {
  let driver;
  let helpers;
  let loginPage;
  let farmerPage;
  let createdProjectTitle;

  // Increase timeout for all tests
  this.timeout(180000);

  before(async function() {
    this.timeout(180000);
    console.lo