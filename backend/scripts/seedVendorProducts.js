/* Seed sample vendor products across categories.
 * Usage: node scripts/seedVendorProducts.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not set in .env');
  process.exit(1);
}

const sampleProducts = [
  {
    name: 'Organic Nitrogen Fertilizer',
    category: 'Fertilizers',
    price: 899,
    stock: 120,
    description: 'Slow-release organic nitrogen fertilizer suitable for vegetables and cereals.',
  },
  {
    name: 'Crop Guard Pesticide',
    category: 'Pesticides',
    price: 649,
    stock: 80,
    description: 'Broad-spectrum contact pesticide for common pests. Follow safety guidelines.',
    safetyDocuments: [],
  },
  {
    name: 'Heavy-Duty Knapsack Sprayer',
    category: 'Equipment & Tools',
    price: 2450,
    stock: 35,
    description: '16L backpack sprayer with ergonomic straps and brass nozzle for uniform spray.',
  },
];

async function run() {
  await mongoose.connect(MONGO_URI, {});
  console.log('✅ Connected to MongoDB');

  const vendor = await Vendor.findOne();
  if (!vendor) {
    console.error('❌ No vendor found. Please create a vendor first.');
    process.exit(1);
  }

  for (const product of sampleProducts) {
    const exists = await Product.findOne({ vendorId: vendor._id, name: product.name });
    if (exists) {
      console.log(`ℹ️  Skipping existing product: ${product.name}`);
      continue;
    }

    const created = await Product.create({
      vendorId: vendor._id,
      ...product,
      images: [],
      isActive: true,
    });
    console.log(`✅ Added product: ${created.name} (${created.category})`);
  }

  await mongoose.disconnect();
  console.log('🏁 Done seeding products.');
}

run().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});


