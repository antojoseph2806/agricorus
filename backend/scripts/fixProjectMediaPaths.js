// Script to fix project media file paths
const mongoose = require('mongoose');
const Project = require('../models/Project');
require('dotenv').config();

const fixFilePath = (filePath) => {
  if (!filePath) return filePath;
  // Convert backslashes to forward slashes and extract relative path
  return filePath.replace(/\\/g, '/').replace(/^.*\/uploads\//, 'uploads/');
};

async function fixProjectMediaPaths() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all projects
    const projects = await Project.find({});
    console.log(`📊 Found ${projects.length} projects to check`);

    let updatedCount = 0;

    for (const project of projects) {
      let needsUpdate = false;

      // Fix farmer verification documents
      if (project.farmerVerification) {
        if (project.farmerVerification.aadhaarDocument) {
          const oldPath = project.farmerVerification.aadhaarDocument;
          const newPath = fixFilePath(oldPath);
          if (oldPath !== newPath) {
            project.farmerVerification.aadhaarDocument = newPath;
            needsUpdate = true;
            console.log(`  📄 Fixed aadhaar document path for project: ${project.title}`);
          }
        }
        if (project.farmerVerification.govtIdDocument) {
          const oldPath = project.farmerVerification.govtIdDocument;
          const newPath = fixFilePath(oldPath);
          if (oldPath !== newPath) {
            project.farmerVerification.govtIdDocument = newPath;
            needsUpdate = true;
            console.log(`  📄 Fixed govt ID document path for project: ${project.title}`);
          }
        }
      }

      // Fix land ownership documents
      if (project.landOwnership && project.landOwnership.documents) {
        project.landOwnership.documents.forEach((doc, index) => {
          const oldPath = doc.filePath;
          const newPath = fixFilePath(oldPath);
          if (oldPath !== newPath) {
            project.landOwnership.documents[index].filePath = newPath;
            needsUpdate = true;
            console.log(`  📄 Fixed ownership document ${index + 1} path for project: ${project.title}`);
          }
        });
      }

      // Fix land media photos
      if (project.landMedia && project.landMedia.photos) {
        project.landMedia.photos.forEach((photo, index) => {
          const oldPath = photo.filePath;
          const newPath = fixFilePath(oldPath);
          if (oldPath !== newPath) {
            project.landMedia.photos[index].filePath = newPath;
            needsUpdate = true;
            console.log(`  🖼️  Fixed photo ${index + 1} path for project: ${project.title}`);
          }
        });
      }

      // Fix land media videos
      if (project.landMedia && project.landMedia.videos) {
        project.landMedia.videos.forEach((video, index) => {
          const oldPath = video.filePath;
          const newPath = fixFilePath(oldPath);
          if (oldPath !== newPath) {
            project.landMedia.videos[index].filePath = newPath;
            needsUpdate = true;
            console.log(`  🎥 Fixed video ${index + 1} path for project: ${project.title}`);
          }
        });
      }

      // Save if updated
      if (needsUpdate) {
        await project.save();
        updatedCount++;
        console.log(`✅ Updated project: ${project.title}`);
      }
    }

    console.log(`\n🎉 Migration complete! Updated ${updatedCount} projects.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
fixProjectMediaPaths();
