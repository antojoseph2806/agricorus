// Dedicated admin project routes
const express = require("express");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

console.log('🔧 Loading adminProjectRoutes.js...');

// GET ALL PROJECTS (Admin only)
router.get("/projects", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    console.log('🔍 ADMIN GET PROJECTS REQUEST');
    const projects = await Project.find()
      .populate("farmerId", "_id name email")
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${projects.length} projects for admin`);
    res.json(projects);
  } catch (err) {
    console.error('❌ Admin get projects error:', err);
    res.status(500).json({ error: err.message });
  }
});

// APPROVE PROJECT (Admin)
router.patch("/projects/:id/approve", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    console.log('🔍 ADMIN APPROVE REQUEST:', {
      projectId: req.params.id,
      userRole: req.user?.role,
      userId: req.user?.id
    });

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('❌ Invalid project ID:', req.params.id);
      return res.status(400).json({ error: "Invalid project ID" });
    }
    
    const project = await Project.findById(req.params.id);
    console.log('🔍 Project lookup result:', project ? `Found: ${project.title}` : 'Not found');
    
    if (!project) {
      console.log('❌ Project not found in database for ID:', req.params.id);
      return res.status(404).json({ error: "Project not found" });
    }

    // Update project
    project.isApproved = true;
    project.status = "open";
    await project.save();
    
    console.log('✅ Project approved successfully:', project.title);
    res.json({ 
      message: "Project approved successfully", 
      project: {
        _id: project._id,
        title: project.title,
        isApproved: project.isApproved,
        status: project.status
      }
    });
  } catch (err) {
    console.error('❌ Approve error:', err);
    res.status(500).json({ error: err.message });
  }
});

// REJECT PROJECT (Admin)
router.patch("/projects/:id/reject", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    console.log('🔍 ADMIN REJECT REQUEST:', {
      projectId: req.params.id,
      userRole: req.user?.role,
      userId: req.user?.id
    });

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }
    
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Update project
    project.isApproved = false;
    project.status = "closed";
    project.rejectionReason = reason;
    await project.save();
    
    console.log('✅ Project rejected successfully:', project.title);
    res.json({ 
      message: "Project rejected successfully", 
      project: {
        _id: project._id,
        title: project.title,
        isApproved: project.isApproved,
        status: project.status,
        rejectionReason: project.rejectionReason
      }
    });
  } catch (err) {
    console.error('❌ Reject error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;