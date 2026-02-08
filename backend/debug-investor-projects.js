require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const User = require('./models/User'); // Need this for populate to work

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // This is what the API endpoint does
    const projects = await Project.find({ 
      isApproved: true,
      status: { $in: ["open", "ongoing", "funded"] }
    })
      .populate("farmerId", "_id name email")
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${projects.length} projects for investors\n`);
    
    if (projects.length > 0) {
      console.log('Project details:');
      projects.forEach(p => {
        console.log(`\n  Title: ${p.title}`);
        console.log(`  ID: ${p._id}`);
        console.log(`  Status: ${p.status}`);
        console.log(`  Approved: ${p.isApproved}`);
        console.log(`  Crop Type: ${p.cropType}`);
        console.log(`  Funding Goal: ₹${p.fundingGoal}`);
        console.log(`  Current Funding: ₹${p.currentFunding}`);
        console.log(`  Farmer: ${p.farmerId ? p.farmerId.name || p.farmerId.email : 'N/A'}`);
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
