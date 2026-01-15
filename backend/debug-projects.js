// Debug script to check projects in database
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agricorus')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Define Project schema (simplified)
const projectSchema = new mongoose.Schema({
  title: String,
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: String,
  isApproved: Boolean,
  fundingGoal: Number,
  currentFunding: Number,
  createdAt: Date
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);

async function debugProjects() {
  try {
    console.log('\n🔍 Checking projects in database...\n');
    
    // Get all projects without populate to avoid schema issues
    const projects = await Project.find().limit(5);
    
    console.log(`📊 Total projects found: ${projects.length}\n`);
    
    if (projects.length === 0) {
      console.log('❌ No projects found in database');
      return;
    }
    
    projects.forEach((project, index) => {
      console.log(`Project ${index + 1}:`);
      console.log(`  ID: ${project._id}`);
      console.log(`  Title: ${project.title}`);
      console.log(`  Status: ${project.status}`);
      console.log(`  Approved: ${project.isApproved}`);
      console.log(`  FarmerID: ${project.farmerId}`);
      console.log(`  Created: ${project.createdAt}`);
      console.log('  ---');
    });
    
    // Check for pending projects specifically
    const pendingProjects = await Project.find({ isApproved: false });
    console.log(`\n⏳ Pending approval projects: ${pendingProjects.length}`);
    
    if (pendingProjects.length > 0) {
      console.log('\nPending projects:');
      pendingProjects.forEach(project => {
        console.log(`  - ${project.title} (ID: ${project._id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugProjects();