require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Check all projects
    const allProjects = await Project.find({});
    console.log('\n📊 Total projects in database:', allProjects.length);
    
    // Check approved projects
    const approvedProjects = await Project.find({ isApproved: true });
    console.log('✅ Approved projects:', approvedProjects.length);
    
    // Check projects by status
    const openProjects = await Project.find({ status: 'open' });
    console.log('🔓 Open projects:', openProjects.length);
    
    // Check approved AND open
    const investorProjects = await Project.find({ 
      isApproved: true,
      status: { $in: ['open', 'ongoing', 'funded'] }
    });
    console.log('💰 Projects for investors (approved + open/ongoing/funded):', investorProjects.length);
    
    console.log('\n📋 Project Details:');
    allProjects.forEach(p => {
      console.log(`  - ${p.title}`);
      console.log(`    Status: ${p.status}, Approved: ${p.isApproved}`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
