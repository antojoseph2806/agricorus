// routes/projectRoutes.js
const express = require("express");
const Project = require("../models/Project");
const Investment = require("../models/Investment");
const auth = require("../middleware/auth"); // ✅ Authentication middleware
const authorizeRoles = require("../middleware/authorizeRoles"); // ✅ Role-based authorization

const router = express.Router();

/**
 * Create new project (Farmer only)
 */
router.post(
  "/projects",
  auth,
  authorizeRoles("farmer"),
  async (req, res) => {
    try {
      const project = new Project({
        ...req.body,
        createdBy: req.user.id, // ✅ Track farmer who created it
      });
      await project.save();
      res.status(201).json(project);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * Get all projects (public)
 */
router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find().populate("createdBy", "name email");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get project by ID (public)
 */
router.get("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update project (Farmer who created it OR Admin)
 */
router.put(
  "/projects/:id",
  auth,
  authorizeRoles("farmer", "admin"),
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ error: "Project not found" });

      // ✅ Farmers can update only their own projects
      if (req.user.role === "farmer" && project.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to update this project" });
      }

      Object.assign(project, req.body);
      await project.save();

      res.json(project);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

/**
 * Delete project (Farmer who created it OR Admin)
 */
router.delete(
  "/projects/:id",
  auth,
  authorizeRoles("farmer", "admin"),
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ error: "Project not found" });

      // ✅ Farmers can delete only their own projects
      if (req.user.role === "farmer" && project.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to delete this project" });
      }

      await project.deleteOne();
      res.json({ message: "Project deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * Invest in a project (Investor)
 */
router.post("/projects/:id/invest", auth, authorizeRoles("investor"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    if (project.status !== "open")
      return res.status(400).json({ error: "Project is not open for funding" });

    const investment = new Investment({
      projectId: req.params.id,
      investorId: req.user.id,
      amount: req.body.amount,
    });
    await investment.save();

    // Update project funding
    project.currentFunding += req.body.amount;
    if (project.currentFunding >= project.fundingGoal) {
      project.status = "funded";
    }
    await project.save();

    res.status(201).json(investment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * Get all investments in a project
 */
router.get("/projects/:id/investments", async (req, res) => {
  try {
    const investments = await Investment.find({ projectId: req.params.id }).populate(
      "investorId",
      "name email"
    );
    res.json(investments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all investments by a user
 */
router.get("/users/:id/investments", async (req, res) => {
  try {
    const investments = await Investment.find({ investorId: req.params.id }).populate(
      "projectId",
      "title"
    );
    res.json(investments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
