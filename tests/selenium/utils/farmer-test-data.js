const faker = require('faker');

/**
 * Generate test data for farmer CRUD operations
 */
class FarmerTestData {
  /**
   * Generate unique project data
   */
  static generateProjectData() {
    const timestamp = Date.now();
    const futureDate = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000);
    
    return {
      title: `Selenium Test Project ${timestamp}`,
      description: `This is an automated test project for ${faker.commerce.productName()} farming. ` +
                   `It focuses on sustainable agriculture practices, organic cultivation methods, ` +
                   `and high-yield crop production. The project aims to demonstrate modern farming ` +
                   `techniques while maintaining environmental sustainability.`,
      cropType: faker.random.arrayElement([
        'Organic Tomatoes',
        'Wheat',
        'Rice',
        'Corn',
        'Potatoes',
        'Onions',
        'Carrots',
        'Cabbage'
      ]),
      fundingGoal: faker.random.number({ min: 50000, max: 200000 }),
      endDate: futureDate.toISOString().split('T')[0]
    };
  }

  /**
   * Generate farmer verification data
   */
  static generateVerificationData() {
    const aadhaarNumber = this.generateAadhaarNumber();
    
    return {
      aadhaarNumber: aadhaarNumber,
      govtIdType: faker.random.arrayElement(['AADHAAR', 'VOTER_ID', 'DRIVING_LICENSE', 'PASSPORT']),
      govtIdNumber: aadhaarNumber
    };
  }

  /**
   * Generate land details data
   */
  static generateLandDetails() {
    return {
      state: faker.random.arrayElement([
        'Karnataka',
        'Maharashtra',
        'Tamil Nadu',
        'Andhra Pradesh',
        'Kerala',
        'Gujarat',
        'Punjab',
        'Haryana'
      ]),
      district: faker.address.county(),
      tehsil: `${faker.address.city()} Tehsil`,
      village: `${faker.address.city()} Village`,
      panchayat: `${faker.address.city()} Gram Panchayat`,
      pincode: this.generatePincode(),
      surveyNumber: `${faker.random.number({ min: 100, max: 999 })}/${faker.random.number({ min: 1, max: 9 })}${faker.random.arrayElement(['A', 'B', 'C'])}`,
      landAreaValue: faker.random.number({ min: 1, max: 10, precision: 0.5 }),
      landAreaUnit: faker.random.arrayElement(['ACRE', 'HECTARE', 'BIGHA', 'GUNTHA']),
      landType: faker.random.arrayElement(['AGRICULTURAL', 'IRRIGATED', 'DRY_LAND', 'ORCHARD', 'PLANTATION']),
      latitude: faker.random.number({ min: 8, max: 35, precision: 0.0001 }),
      longitude: faker.random.number({ min: 68, max: 97, precision: 0.0001 })
    };
  }

  /**
   * Generate complete project with all sections
   */
  static generateCompleteProject() {
    return {
      basic: this.generateProjectData(),
      verification: this.generateVerificationData(),
      land: this.generateLandDetails()
    };
  }

  /**
   * Generate Aadhaar number (12 digits)
   */
  static generateAadhaarNumber() {
    let aadhaar = '';
    for (let i = 0; i < 12; i++) {
      aadhaar += faker.random.number({ min: 0, max: 9 });
    }
    return aadhaar;
  }

  /**
   * Generate Indian pincode (6 digits)
   */
  static generatePincode() {
    let pincode = '';
    for (let i = 0; i < 6; i++) {
      pincode += faker.random.number({ min: 0, max: 9 });
    }
    return pincode;
  }

  /**
   * Generate phone number (10 digits)
   */
  static generatePhoneNumber() {
    let phone = faker.random.arrayElement(['9', '8', '7', '6']); // Valid starting digits
    for (let i = 0; i < 9; i++) {
      phone += faker.random.number({ min: 0, max: 9 });
    }
    return phone;
  }

  /**
   * Generate search queries for testing
   */
  static generateSearchQueries() {
    return [
      'Organic',
      'Tomato',
      'Wheat',
      'Rice',
      'Test',
      'Farming',
      'Agriculture',
      'Sustainable'
    ];
  }

  /**
   * Generate filter criteria
   */
  static generateFilterCriteria() {
    return {
      status: faker.random.arrayElement(['open', 'funded', 'closed']),
      verificationStatus: faker.random.arrayElement(['PENDING', 'VERIFIED', 'REJECTED']),
      minFunding: faker.random.number({ min: 10000, max: 50000 }),
      maxFunding: faker.random.number({ min: 100000, max: 500000 })
    };
  }

  /**
   * Generate land filter criteria
   */
  static generateLandFilterCriteria() {
    return {
      minPrice: faker.random.number({ min: 5000, max: 15000 }),
      maxPrice: faker.random.number({ min: 20000, max: 50000 }),
      soilType: faker.random.arrayElement(['Loamy', 'Clay', 'Sandy', 'Black', 'Red', 'Alluvial'])
    };
  }

  /**
   * Generate update data for projects
   */
  static generateUpdateData(originalTitle) {
    return {
      title: `${originalTitle} - Updated`,
      description: `Updated description: ${faker.lorem.paragraph()}`,
      fundingGoal: faker.random.number({ min: 80000, max: 250000 })
    };
  }

  /**
   * Generate profile update data
   */
  static generateProfileUpdateData() {
    return {
      name: faker.name.findName(),
      phone: this.generatePhoneNumber(),
      bio: faker.lorem.sentence()
    };
  }

  /**
   * Generate KYC data
   */
  static generateKYCData() {
    return {
      aadhaarNumber: this.generateAadhaarNumber(),
      panNumber: this.generatePANNumber(),
      bankAccountNumber: this.generateBankAccountNumber(),
      ifscCode: this.generateIFSCCode(),
      bankName: faker.company.companyName() + ' Bank',
      branchName: faker.address.city() + ' Branch'
    };
  }

  /**
   * Generate PAN number
   */
  static generatePANNumber() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    
    let pan = '';
    // 5 letters
    for (let i = 0; i < 5; i++) {
      pan += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    // 4 digits
    for (let i = 0; i < 4; i++) {
      pan += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    // 1 letter
    pan += letters.charAt(Math.floor(Math.random() * letters.length));
    
    return pan;
  }

  /**
   * Generate bank account number
   */
  static generateBankAccountNumber() {
    let account = '';
    for (let i = 0; i < 12; i++) {
      account += faker.random.number({ min: 0, max: 9 });
    }
    return account;
  }

  /**
   * Generate IFSC code
   */
  static generateIFSCCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    
    let ifsc = '';
    // 4 letters
    for (let i = 0; i < 4; i++) {
      ifsc += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    // 1 zero
    ifsc += '0';
    // 6 alphanumeric
    for (let i = 0; i < 6; i++) {
      const useDigit = Math.random() > 0.5;
      if (useDigit) {
        ifsc += digits.charAt(Math.floor(Math.random() * digits.length));
      } else {
        ifsc += letters.charAt(Math.floor(Math.random() * letters.length));
      }
    }
    
    return ifsc;
  }

  /**
   * Generate dispute data
   */
  static generateDisputeData() {
    return {
      title: `Dispute: ${faker.lorem.words(3)}`,
      description: faker.lorem.paragraph(),
      category: faker.random.arrayElement(['Payment', 'Quality', 'Delivery', 'Contract', 'Other']),
      priority: faker.random.arrayElement(['Low', 'Medium', 'High', 'Critical'])
    };
  }

  /**
   * Generate lease request data
   */
  static generateLeaseRequestData() {
    return {
      durationMonths: faker.random.number({ min: 6, max: 36 }),
      proposedPrice: faker.random.number({ min: 10000, max: 30000 }),
      purpose: faker.lorem.sentence(),
      additionalNotes: faker.lorem.paragraph()
    };
  }

  /**
   * Get realistic crop types
   */
  static getCropTypes() {
    return [
      'Wheat',
      'Rice',
      'Corn',
      'Tomatoes',
      'Potatoes',
      'Onions',
      'Carrots',
      'Cabbage',
      'Cauliflower',
      'Broccoli',
      'Spinach',
      'Lettuce',
      'Cucumber',
      'Pumpkin',
      'Watermelon',
      'Mango',
      'Banana',
      'Apple',
      'Orange',
      'Grapes'
    ];
  }

  /**
   * Get Indian states
   */
  static getIndianStates() {
    return [
      'Andhra Pradesh',
      'Arunachal Pradesh',
      'Assam',
      'Bihar',
      'Chhattisgarh',
      'Goa',
      'Gujarat',
      'Haryana',
      'Himachal Pradesh',
      'Jharkhand',
      'Karnataka',
      'Kerala',
      'Madhya Pradesh',
      'Maharashtra',
      'Manipur',
      'Meghalaya',
      'Mizoram',
      'Nagaland',
      'Odisha',
      'Punjab',
      'Rajasthan',
      'Sikkim',
      'Tamil Nadu',
      'Telangana',
      'Tripura',
      'Uttar Pradesh',
      'Uttarakhand',
      'West Bengal'
    ];
  }

  /**
   * Get soil types
   */
  static getSoilTypes() {
    return [
      'Alluvial',
      'Black',
      'Red',
      'Laterite',
      'Desert',
      'Mountain',
      'Saline',
      'Loamy',
      'Clay',
      'Sandy'
    ];
  }

  /**
   * Get land types
   */
  static getLandTypes() {
    return [
      'AGRICULTURAL',
      'IRRIGATED',
      'DRY_LAND',
      'ORCHARD',
      'PLANTATION'
    ];
  }

  /**
   * Get land area units
   */
  static getLandAreaUnits() {
    return [
      'ACRE',
      'HECTARE',
      'BIGHA',
      'GUNTHA'
    ];
  }

  /**
   * Generate batch of projects for bulk testing
   */
  static generateProjectBatch(count = 5) {
    const projects = [];
    for (let i = 0; i < count; i++) {
      projects.push(this.generateCompleteProject());
    }
    return projects;
  }

  /**
   * Generate realistic test scenario
   */
  static generateTestScenario() {
    return {
      farmer: {
        name: faker.name.findName(),
        email: `farmer.test.${Date.now()}@example.com`,
        phone: this.generatePhoneNumber(),
        password: 'Test@123'
      },
      project: this.generateCompleteProject(),
      landFilter: this.generateLandFilterCriteria(),
      leaseRequest: this.generateLeaseRequestData(),
      kyc: this.generateKYCData()
    };
  }
}

module.exports = FarmerTestData;
