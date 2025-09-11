const mongoose = require("mongoose");
const slugify = require("slugify");

const projectSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  cropType: { type: String },
  fundingGoal: { type: Number, required: true },
  currentFunding: { type: Number, default: 0 },
  status: { type: String, enum: ["open", "funded", "closed"], default: "open" },
  isApproved: { type: Boolean, default: false },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  slug: {
    type: String,
    unique: true, // This ensures the slug is unique across all projects
  },
}, { timestamps: true });

// Mongoose pre-save middleware to generate a unique slug
projectSchema.pre("save", async function (next) {
  // Only run this middleware if the title has been modified or it's a new document
  if (this.isModified("title") || this.isNew) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Check if a project with the generated slug already exists
    while (true) {
      const existingProject = await this.constructor.findOne({ slug });
      if (!existingProject) {
        // If no existing project found, the slug is unique
        break;
      }
      // If a duplicate is found, append a counter and check again
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model("Project", projectSchema);
