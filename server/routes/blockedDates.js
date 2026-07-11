const express = require("express");
const router  = express.Router();
const BlockedDate = require("../models/BlockedDate");

// ── GET /api/blocked-dates ─────────────────────────────────────────────────────
// Public - customer booking page calls this to know which dates/slots to fade out.
// Only returns entries from today onwards.
router.get("/", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const blocked = await BlockedDate.find({ date: { $gte: today } }).sort({ date: 1, start_time: 1 });
    res.json(blocked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/blocked-dates ────────────────────────────────────────────────────
// Admin - block a date, either fully or for a specific time range.
// Body (full day):    { date: "2024-12-25", reason: "Diwali holiday" }
// Body (time range):  { date: "2024-12-25", reason: "Lunch break", start_time: "13:00", end_time: "14:00" }
router.post("/", async (req, res) => {
  try {
    const { date, reason, start_time, end_time } = req.body;
    if (!date) return res.status(400).json({ error: "date is required (YYYY-MM-DD)" });

    // Both start_time and end_time must be given together, or neither
    if ((start_time && !end_time) || (!start_time && end_time)) {
      return res.status(400).json({ error: "Provide both start_time and end_time, or leave both empty for a full-day block" });
    }

    const blocked = await BlockedDate.create({
      date,
      reason: reason || "",
      start_time: start_time || "",
      end_time: end_time || "",
    });
    res.status(201).json(blocked);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── DELETE /api/blocked-dates/:id ──────────────────────────────────────────────
// Admin - remove a block (date or specific time-slot block)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await BlockedDate.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Block removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;