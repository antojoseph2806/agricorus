/**
 * Migration script to move existing product images from local storage to Cloudinary
 * Run this script once to migrate all existing product images
 * 
 * Usage: node scripts/migrateProductImagesToCloudinary.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

const migrateProductImages = async () => {
  try {
    console.log('🚀 Starting migration of product images to Cloudinary...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to process`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      console.log(`\n📝 Processing product: ${product.name} (${product._id})`);
      
      let updated = false;

      // Migrate images
      if (product.images && product.images.length > 0) {
        const newImages = [];
        
        for (const imagePath of product.images) {
          // Skip if already a Cloudinary URL
          if (imagePath.includes('cloudinary.com')) {
            console.log(`  ⏭️  Image already on Cloudinary: ${imagePath}`);
            newImages.push(imagePath);
            continue;
          }

          try {
            // Construct local file path
            const localPath = path.join(__dirname, '..', imagePath);
            
            if (!fs.existsSync(localPath)) {
              console.log(`  ⚠️  Local file not found: ${localPath}`);
              skippedCount++;
              continue;
            }

            // Upload to Cloudinary
            console.log(`  ⬆️  Uploading image to Cloudinary...`);
            const result = await cloudinary.uploader.upload(localPath, {
              folder: 'agricorus/products/images',
              transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
            });

            newImages.push(result.secure_url);
            console.log(`  ✅ Uploaded: ${result.secure_url}`);
            
            // Optionally delete local file after successful upload
            // fs.unlinkSync(localPath);
            // console.log(`  🗑️  Deleted local file: ${localPath}`);
            
            updated = true;
          } catch (error) {
            console.error(`  ❌ Error uploading image: ${error.message}`);
            errorCount++;
            // Keep the old path if upload fails
            newImages.push(imagePath);
          }
        }

        if (updated) {
          product.images = newImages;
        }
      }

      // Migrate safety documents
      if (product.safetyDocuments && product.safetyDocuments.length > 0) {
        const newDocs = [];
        
        for (const docPath of product.safetyDocuments) {
          // Skip if already a Cloudinary URL
          if (docPath.includes('cloudinary.com')) {
            console.log(`  ⏭️  Document already on Cloudinary: ${docPath}`);
            newDocs.push(docPath);
            continue;
          }

          try {
            // Construct local file path
            const localPath = path.join(__dirname, '..', docPath);
            
            if (!fs.existsSync(localPath)) {
              console.log(`  ⚠️  Local file not found: ${localPath}`);
              skippedCount++;
              continue;
            }

            // Upload to Cloudinary as raw file (PDF)
            console.log(`  ⬆️  Uploading document to Cloudinary...`);
            const result = await cloudinary.uploader.upload(localPath, {
              folder: 'agricorus/products/safety-docs',
              resource_type: 'raw'
            });

            newDocs.push(result.secure_url);
            console.log(`  ✅ Uploaded: ${result.secure_url}`);
            
            // Optionally delete local file after successful upload
            // fs.unlinkSync(localPath);
            // console.log(`  🗑️  Deleted local file: ${localPath}`);
            
            updated = true;
          } catch (error) {
            console.error(`  ❌ Error uploading document: ${error.message}`);
            errorCount++;
            // Keep the old path if upload fails
            newDocs.push(docPath);
          }
        }

        if (updated) {
          product.safetyDocuments = newDocs;
        }
      }

      // Save product if any files were migrated
      if (updated) {
        await product.save();
        migratedCount++;
        console.log(`  💾 Product updated successfully`);
      } else {
        console.log(`  ⏭️  No changes needed for this product`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log(`  ✅ Products migrated: ${migratedCount}`);
    console.log(`  ⏭️  Files skipped: ${skippedCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    console.log('='.repeat(60));
    console.log('\n✨ Migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
};

// Run migration
migrateProductImages();
