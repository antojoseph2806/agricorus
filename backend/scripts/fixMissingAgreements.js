// Script to fix missing agreements for active leases
const mongoose = require('mongoose');
const Lease = require('../models/Lease');
const generateLeasePDF = require('../utils/generateLeasePDF');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function fixMissingAgreements() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Find all active leases without agreements
    const leasesWithoutAgreements = await Lease.find({
      status: 'active',
      $or: [
        { agreementUrl: { $exists: false } },
        { agreementUrl: null },
        { agreementUrl: '' }
      ]
    })
    .populate('land', 'title location')
    .populate('farmer', 'name email')
    .populate('owner', 'name email');

    console.log(`📋 Found ${leasesWithoutAgreements.length} active leases without agreements`);

    if (leasesWithoutAgreements.length === 0) {
      console.log('✅ All active leases already have agreements!');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const lease of leasesWithoutAgreements) {
      try {
        console.log(`🔄 Processing lease ${lease._id}...`);
        
        // Generate PDF
        const pdfPath = await generateLeasePDF(lease);
        
        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(pdfPath, {
          folder: "agreements",
          resource_type: "raw",
        });
        
        // Update lease with agreement URL
        lease.agreementUrl = uploadResult.secure_url;
        await lease.save();
        
        console.log(`✅ Generated agreement for lease ${lease._id}`);
        successCount++;
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing lease ${lease._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successfully generated: ${successCount} agreements`);
    console.log(`❌ Failed to generate: ${errorCount} agreements`);
    console.log(`📋 Total processed: ${leasesWithoutAgreements.length} leases`);

  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the script
if (require.main === module) {
  fixMissingAgreements()
    .then(() => {
      console.log('✨ Script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = fixMissingAgreements;