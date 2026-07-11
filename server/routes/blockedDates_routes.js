const express = require("express");
const router  = express.Router();
const BlockedDate = require("../models/BlockedDate");

// ── GET /api/blocked-dates ─────────────────────────────────────────────────────
// Public - customer booking page calls this to know which dates to fade out.
// Only returns dates from today onwards (no need to send old past dates).
router.get("/", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const blocked = await BlockedDate.find({ date: { $gte: today } }).sort({ date: 1 });
    res.json(blocked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/blocked-dates ────────────────────────────────────────────────────
// Admin - mark a date as unavailable
// Body: { date: "2024-12-25", reason: "Diwali holiday" }
router.post("/", async (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!date) return res.status(400).json({ error: "date is required (YYYY-MM-DD)" });

    const blocked = await BlockedDate.findOneAndUpdate(
      { date },
      { date, reason: reason || "" },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json(blocked);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE /api/blocked-dates/:id ──────────────────────────────────────────────
// Admin - un-block a date (customer can book it again)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await BlockedDate.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Date unblocked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
