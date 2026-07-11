const mongoose = require("mongoose");

// Dates/time-slots the admin marks as unavailable.
// If start_time & end_time are empty → the ENTIRE day is blocked.
// If start_time & end_time are set → only that time range is blocked
// (e.g. lunch break 1:00 PM - 2:00 PM), rest of the day stays bookable.
const blockedDateSchema = new mongoose.Schema(
  {
    date:       { type: String, required: true },        // "YYYY-MM-DD"
    reason:     { type: String, default: "" },            // "Festival holiday", "Lunch break"
    start_time: { type: String, default: "" },            // "13:00" - empty means full day
    end_time:   { type: String, default: "" },            // "14:00" - empty means full day
  },
  { timestamps: true }
);

// Same date can have multiple partial blocks (e.g. lunch + evening break)
// but only ONE full-day block makes sense - app logic handles that, not a DB constraint.
blockedDateSchema.index({ date: 1 });

module.exports = mongoose.model("BlockedDate", blockedDateSchema);