const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customer_name:  { type: String, required: true, trim: true },
    customer_phone: { type: String, required: true, trim: true },
    customer_email: { type: String, default: "", trim: true },

    // Frontend services array (multiple services select pannuvaan)
    services_list:  { type: [String], default: [] },  // ["Hair Cut", "Beard Trim"]

    // Barber chosen by customer
    barber: { type: String, default: "No Preference" },

    // Actual total duration of selected services - used for correct slot blocking
    duration_minutes: { type: Number, default: 30, min: 5 },

    booking_date: { type: String, required: true },  // "YYYY-MM-DD"
    start_time:   { type: String, required: true },  // "14:30"
    end_time:     { type: String, required: true },  // "15:30" - auto calc

    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },

    notes:  { type: String, default: "" },
    amount: { type: Number, required: true, min: 0 }, // cartTotal from frontend
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

bookingSchema.index({ booking_date: 1, status: 1 });

// "HH:MM" → total minutes
bookingSchema.statics.timeToMinutes = function (t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// start_time "14:30" + 60 mins → "15:30"
bookingSchema.statics.calcEndTime = function (startTime, durationMinutes) {
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + durationMinutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

// Overlap check - returns conflicting booking or null
bookingSchema.statics.checkOverlap = async function (booking_date, start_time, end_time, excludeId = null) {
  const startMins = this.timeToMinutes(start_time);
  const endMins   = this.timeToMinutes(end_time);

  const active = await this.find({
    booking_date,
    status: { $in: ["pending", "completed"] },
    ...(excludeId && { _id: { $ne: excludeId } }),
  });

  for (const b of active) {
    const bStart = this.timeToMinutes(b.start_time);
    const bEnd   = this.timeToMinutes(b.end_time);
    if (startMins < bEnd && endMins > bStart) return b;
  }
  return null;
};

module.exports = mongoose.model("Booking", bookingSchema);