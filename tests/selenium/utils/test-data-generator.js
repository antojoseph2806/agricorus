const faker = require('faker');

class TestDataGenerator {
  /**
   * Generate random land data
   */
  static generateLandData(overrides = {}) {
    return {
      title: `${faker.commerce.productName()} Agricultural Land`,
      soilType: faker.random.arrayElement(['Loamy', 'Clay', 'Sandy', 'Silt', 'Peaty', 'Chalky']),
      waterSource: faker.random.arrayElement(['Borewell', 'Canal', 'River', 'Pond', 'Rainwater', 'Well']),
      accessibility: faker.random.arrayElement([
        'Good Road Access',
        'Highway Adjacent',
        'Village Road',
        'Kutcha Road',
        'Paved Road'
      ]),
      sizeInAcres: parseFloat((Math.random() * 50 + 1).toFixed(2)),
      leasePricePerMonth: Math.floor(Math.random() * 50000 + 5000),
      leaseDurationMonths: faker.random.arrayElement([6, 12, 24, 36, 48, 60]),
      location: {
        address: `${faker.address.streetAddress()}, ${faker.address.city()}, ${faker.address.state()}`,
        latitude: parseFloat(faker.address.latitude()),
        longitude: parseFloat(faker.address.longitude())
      },
      ...overrides
    };
  }

  /**
   * Generate multiple land listings
   */
  static generateMultipleLands(count = 5) {
    const lands = [];
    for (let i = 0; i < count; i++) {
      lands.push(this.generateLandData());
    }
    return lands;
  }

  /**
   * Generate land with specific characteristics
   */
  static generateSmallLand() {
    return this.generateLandData({
      title: 'Small Agricultural Plot',
      sizeInAcres: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
      leasePricePerMonth: Math.floor(Math.random() * 10000 + 3000),
      leaseDurationMonths: 6
    });
  }

  static generateLargeLand() {
    return this.generateLandData({
      title: 'Large Agricultural Estate',
      sizeInAcres: parseFloat((Math.random() * 100 + 50).toFixed(2)),
      leasePricePerMonth: Math.floor(Math.random() * 100000 + 50000),
      leaseDurationMonths: 60
    });
  }

  static generatePremiumLand() {
    return this.generateLandData({
      title: 'Premium Agricultural Land',
      soilType: 'Loamy',
      waterSource: 'Canal',
      accessibility: 'Highway Adjacent',
      sizeInAcres: parseFloat((Math.random() * 20 + 10).toFixed(2)),
      leasePricePerMonth: Math.floor(Math.random() * 75000 + 25000),
      leaseDurationMonths: 36
    });
  }

  /**
   * Generate invalid land data for negative testing
   */
  static generateInvalidLandData(invalidField) {
    const baseData = this.generateLandData();
    
    switch (invalidField) {
      case 'title':
        return { ...baseData, title: '' };
      case 'size':
        return { ...baseData, sizeInAcres: -5 };
      case 'price':
        return { ...baseData, leasePricePerMonth: 0 };
      case 'duration':
        return { ...baseData, leaseDurationMonths: -12 };
      case 'coordinates':
        return {
          ...baseData,
          location: {
            ...baseData.location,
            latitude: 200,
            longitude: 200
          }
        };
      default:
        return baseData;
    }
  }

  /**
   * Generate edge case data
   */
  static generateEdgeCaseData(caseType) {
    const baseData = this.generateLandData();
    
    switch (caseType) {
      case 'maxLength':
        return {
          ...baseData,
          title: 'A'.repeat(200),
          accessibility: 'B'.repeat(500)
        };
      case 'specialChars':
        return {
          ...baseData,
          title: 'Land with Special !@#$%^&*() Characters'
        };
      case 'unicode':
        return {
          ...baseData,
          title: 'भूमि 土地 أرض Земля'
        };
      case 'minValues':
        return {
          ...baseData,
          sizeInAcres: 0.01,
          leasePricePerMonth: 1,
          leaseDurationMonths: 1
        };
      case 'maxValues':
        return {
          ...baseData,
          sizeInAcres: 9999.99,
          leasePricePerMonth: 9999999,
          leaseDurationMonths: 999
        };
      default:
        return baseData;
    }
  }

  /**
   * Generate user credentials
   */
  static generateUserCredentials(role = 'landowner') {
    return {
      name: faker.name.findName(),
      email: faker.internet.email().toLowerCase(),
      password: 'Test@' + faker.random.alphaNumeric(8),
      phone: '9' + faker.random.number({ min: 100000000, max: 999999999 }),
      role: role
    };
  }

  /**
   * Generate location data
   */
  static generateLocation() {
    return {
      address: `${faker.address.streetAddress()}, ${faker.address.city()}, ${faker.address.state()}, ${faker.address.zipCode()}`,
      latitude: parseFloat(faker.address.latitude()),
      longitude: parseFloat(faker.address.longitude())
    };
  }

  /**
   * Generate Indian location data
   */
  static generateIndianLocation() {
    const states = [
      'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan',
      'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Kerala'
    ];
    
    return {
      address: `${faker.address.streetAddress()}, ${faker.address.city()}, ${faker.random.arrayElement(states)}`,
      latitude: parseFloat((Math.random() * (35 - 8) + 8).toFixed(6)),
      longitude: parseFloat((Math.random() * (97 - 68) + 68).toFixed(6))
    };
  }

  /**
   * Generate realistic Indian agricultural land data
   */
  static generateIndianLandData() {
    const crops = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Pulses', 'Vegetables'];
    const soilTypes = ['Black Soil', 'Red Soil', 'Alluvial Soil', 'Laterite Soil'];
    
    return {
      title: `${faker.random.arrayElement(crops)} Cultivation Land`,
      soilType: faker.random.arrayElement(soilTypes),
      waterSource: faker.random.arrayElement(['Borewell', 'Canal', 'River', 'Well']),
      accessibility: faker.random.arrayElement(['Pucca Road', 'Kutcha Road', 'Highway Adjacent']),
      sizeInAcres: parseFloat((Math.random() * 10 + 1).toFixed(2)),
      leasePricePerMonth: Math.floor(Math.random() * 20000 + 5000),
      leaseDurationMonths: faker.random.arrayElement([6, 12, 24]),
      location: this.generateIndianLocation()
    };
  }
}

module.exports = TestDataGenerator;
