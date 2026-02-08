// routes/projectRoutes.js
console.log('🔧 Loading projectRoutes.js...');
const express = require("express");
const mongoose = require("mongoose");
const Project = require("../models/Project");
const Investment = require("../models/Investment");
const auth = require("../middleware/auth");
const authorizeRoles = require("../middleware/authorizeRoles");
const { createVerifiedProject, getVerificationStatus } = require("../controllers/verifiedProjectController");

const router = express.Router();

// Add logging middleware to see all requests
router.use((req, res, next) => {
  if (req.path.includes('approve') || req.path.includes('reject')) {
    console.log('🔍 PROJECT ROUTE REQUEST:', {
      method: req.method,
      path: req.path,
      url: req.url,
      params: req.params
    });
  }
  next();
});

/* -----------------------------
   CREATE PROJECT  (Farmer)
------------------------------ */
router.post("/", auth, authorizeRoles("farmer"), async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      farmerId: req.user.id,
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* -----------------------------
   CREATE VERIFIED PROJECT (Farmer)
------------------------------ */
router.post("/create-verified", auth, authorizeRoles("farmer"), createVerifiedProject);

/* -----------------------------
   GET PROJECT VERIFICATION STATUS (Farmer)
------------------------------ */
router.get("/:id/verification-status", auth, authorizeRoles("farmer"), getVerificationStatus);
/* -----------------------------
   GET ALL PROJECTS (Admin only)
------------------------------ */
router.get("/admin/projects", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    console.log('🔍 ADMIN PROJECTS REQUEST from user:', req.user?.role, req.user?.id);
    
    const projects = await Project.find()
      .populate("farmerId", "_id name email")
      .sort({ createdAt: -1 }); // latest first

    console.log(`📊 Sending ${projects.length} projects to admin`);
    projects.forEach(project => {
      console.log(`  - ${project.title} (ID: ${project._id}, Approved: ${project.isApproved})`);
    });

    res.json(projects);
  } catch (err) {
    console.error('❌ Admin projects fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});
/* -----------------------------
   APPROVED PROJECT ROUTES (public)
   👉 keep these ABOVE /:id
------------------------------ */
router.get("/approved", async (req, res) => {
  try {
    const projects = await Project.find({ isApproved: true })
      .populate("farmerId", "_id name email")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------
// GET ALL PROJECTS (Investor specific)
// 👉 MUST be BEFORE /:id route
// -----------------------------
router.get("/investor", auth, async (req, res) => {
  console.log('\n🔍 === INVESTOR PROJECTS REQUEST ===');
  console.log('User:', req.user ? {
    id: req.user._id,
    email: req.user.email,
    role: req.user.role
  } : 'NO USER');
  
  try {
    if (!req.user) {
      console.log('❌ No user in request');
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (req.user.role !== "investor") {
      console.log(`❌ Wrong role: ${req.user.role}`);
      return res.status(403).json({ error: "Access denied. Investors only." });
    }

    console.log('✅ User is investor, fetching projects...');
    
    // Fetch projects that are approved and open for investment
    const projects = await Project.find({ 
      isApproved: true,
      status: { $in: ["open", "ongoing", "funded"] }
    })
      .populate("farmerId", "_id name email")
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${projects.length} approved projects`);
    console.log('Projects:', projects.map(p => ({ title: p.title, status: p.status, approved: p.isApproved })));
    console.log('=== END REQUEST ===\n');
    
    res.json(projects);
  } catch (err) {
    console.error("❌ Error fetching investor projects:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------
   VIEW CLOSED PROJECTS
------------------------------ */
router.get("/closed", auth, async (req, res) => {
  try {
    const projects = await Project.find({ status: "closed" })
      .populate("farmerId", "name email"); // populate farmer details

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/approved/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      isApproved: true,
    }).populate("farmerId", "_id name email");

    if (!project) return res.status(404).json({ error: "Approved project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/approved/slug/:slug", async (req, res) => {
  try {
    const project = await Project.findOne({
      slug: req.params.slug,
      isApproved: true,
    }).populate("farmerId", "_id name email");

    if (!project) return res.status(404).json({ error: "Approved project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/* -----------------------------
   VIEW FUNDED PROJECTS
------------------------------ */
router.get("/funded", auth, async (req, res) => {
  try {
    const projects = await Project.find({ status: "funded" })
      .populate("farmerId", "name email"); // include farmer info

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/* -----------------------------
   ADMIN PROJECT MANAGEMENT ROUTES
   👉 IMPORTANT: Keep these ABOVE generic /projects/:id route
------------------------------ */

/* APPROVE PROJECT (Admin) */
console.log('🔧 Registering APPROVE route: /:id/approve');
router.patch(
  "/:id/approve",
  (req, res, next) => {
    console.log('🔍 APPROVE MIDDLEWARE: Route matched!', req.params.id);
    next();
  },
  auth,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      console.log('🔍 APPROVE REQUEST:', {
        projectId: req.params.id,
        isValidObjectId: mongoose.Types.ObjectId.isValid(req.params.id),
        userRole: req.user?.role,
        userId: req.user?.id
      });

      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        console.log('❌ Invalid project ID:', req.params.id);
        return res.status(400).json({ error: "Invalid project ID" });
      }
      
      const project = await Project.findById(req.params.id);
      console.log('🔍 Project found:', project ? `${project.title} (${project._id})` : 'null');
      
      if (!project) {
        console.log('❌ Project not found in database for ID:', req.params.id);
        return res.status(404).json({ error: "Project not found" });
      }

      project.isApproved = true;
      project.status = "open"; // Make it available for funding
      await project.save();
      
      console.log('✅ Project approved successfully:', project.title);
      res.json({ message: "Project approved successfully", project });
    } catch (err) {
      console.error('❌ Approve error:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

/* REJECT PROJECT (Admin) */
router.patch(
  "/:id/reject",
  auth,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }

      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ error: "Project not found" });

      project.isApproved = false;
      project.status = "closed";
      project.rejectionReason = reason;
      await project.save();
      
      res.json({ message: "Project rejected successfully", project });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* CLOSE PROJECT (Admin) */
router.patch("/:id/close", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    project.status = "closed";
    await project.save();

    res.json({ message: "Project closed successfully", project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* MARK PROJECT AS FUNDED (Admin) */
router.patch(
  "/:id/mark-funded",
  auth,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ error: "Project not found" });

      if (project.status === "funded") {
        return res.status(400).json({ error: "Project is already funded" });
      }

      project.status = "funded";
      project.currentFunding = project.fundingGoal;
      await project.save();

      res.json({ message: "Project marked as funded by admin", project });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* -----------------------------
   GET ALL PROJECTS (public)
------------------------------ */
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate("farmerId", "_id name email");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------
   INVEST IN PROJECT (Investor)
------------------------------ */
router.post(
  "/:id/invest",
  auth,
  authorizeRoles("investor"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res
          .status(400)
          .json({ error: "Investment amount must be greater than zero" });
      }

      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ error: "Project not found" });
      if (project.status !== "open") {
        return res.status(400).json({ error: "Project is not open for funding" });
      }

      const investment = new Investment({
        projectId: req.params.id,
        investorId: req.user.id,
        amount,
      });
      await investment.save();

      project.currentFunding += amount;
      if (project.currentFunding >= project.fundingGoal) {
        project.status = "funded";
      }
      await project.save();

      res.status(201).json(investment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* -----------------------------
   INVESTOR FUND PROJECT
------------------------------ */
router.patch(
  "/:id/fund",
  auth,
  authorizeRoles("investor"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }

      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Funding amount must be greater than 0" });
      }

      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ error: "Project not found" });
      if (project.status !== "open") {
        return res.status(400).json({ error: "Project is not open for funding" });
      }

      project.currentFunding += amount;

      // Auto-mark funded if goal reached
      if (project.currentFunding >= project.fundingGoal) {
        project.status = "funded";
      }

      await project.save();

      res.json({ message: "Funding successful", project });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* -----------------------------
   GET INVESTMENTS FOR PROJECT
------------------------------ */
router.get("/:id/investments", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }
    const investments = await Investment.find({
      projectId: req.params.id,
    }).populate("investorId", "_id name email");
    res.json(investments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------
   GET PROJECT BY ID (public)
------------------------------ */
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }
    const project = await Project.findById(req.params.id).populate(
      "farmerId",
      "_id name email"
    );
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------
   GET PROJECT BY SLUG (public)
------------------------------ */
router.get("/slug/:slug", async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug }).populate(
      "farmerId",
      "_id name email"
    );
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -----------------------------
// GET PROJECT BY ID (Investor specific)
// -----------------------------
router.get("/investor/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "investor") {
      return res.status(403).json({ error: "Access denied. Investors only." });
    }

    // Only allow access to "open" projects
    const project = await Project.findOne({
      _id: req.params.id,
      status: "open",
    }).populate("farmerId", "_id name email");

    if (!project) {
      return res.status(404).json({ error: "Project not found or not accessible." });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* -----------------------------
   UPDATE PROJECT (Farmer/Admin)
------------------------------ */
router.put(
  "/:id",
  auth,
  authorizeRoles("farmer", "admin"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ error: "Project not found" });

      if (
        req.user.role === "farmer" &&
        project.farmerId.toString() !== req.user.id
      ) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this project" });
      }

      Object.assign(project, req.body);
      await project.save();
      res.json(project);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

/* -----------------------------
   DELETE PROJECT (Farmer/Admin)
------------------------------ */
router.delete(
  "/:id",
  auth,
  authorizeRoles("farmer", "admin"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ error: "Project not found" });

      if (
        req.user.role === "farmer" &&
        project.farmerId.toString() !== req.user.id
      ) {
        return res
          .status(403)
          .json({ error: "Not authorized to delete this project" });
      }

      await project.deleteOne();
      res.json({ message: "Project deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * Get Total Funding across all projects
 */
router.get("/total-funding", auth, authorizeRoles("admin"), async (req, res) => {
  try {
    // Aggregate sum of currentFunding from all projects
    const result = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalFunding: { $sum: "$currentFunding" }
        }
      }
    ]);

    const totalFunding = result.length > 0 ? result[0].totalFunding : 0;

    res.json({ totalFunding });
  } catch (err) {
    console.error("Error fetching total funding:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
