const mongoose = require("mongoose");

// Dates the admin marks as unavailable (holidays, personal leave, etc.)
// Customer booking page fetches this list and disables these dates automatically.
const blockedDateSchema = new mongoose.Schema(
  {
    date:   { type: String, required: true, unique: true }, // "YYYY-MM-DD"
    reason: { type: String, default: "" },                  // "Festival holiday", "Personal leave"
  },
  { timestamps: true }
);

module.exports = mongoose.model("BlockedDate", blockedDateSchema);
