const express = require("express");
const router = express.Router();
const Package = require("../models/Package");

// GET /api/packages         → All packages
// GET /api/packages?active=true → Only active packages (booking form la use pannu)
router.get("/", async (req, res) => {
  try {
    const filter = req.query.active === "true" ? { is_active: true } : {};
    const packages = await Package.find(filter).sort({ name: 1 });
    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/packages/:id
router.get("/:id", async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ error: "Package not found" });
    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/packages → Create new package
router.post("/", async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    res.status(201).json(pkg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/packages/:id → Update package
router.put("/:id", async (req, res) => {
  try {
    const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!pkg) return res.status(404).json({ error: "Package not found" });
    res.json(pkg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/packages/:id
router.delete("/:id", async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ error: "Package not found" });
    res.json({ message: "Package deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
