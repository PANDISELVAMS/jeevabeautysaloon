const express = require("express");
const router  = express.Router();
const Booking = require("../models/Booking");
const { notifyNewBooking, updateBookingMessage } = require("../utils/telegram");

// Fallback ONLY used if frontend somehow doesn't send a duration
const FALLBACK_DURATION = 30;

// GET /api/bookings
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.status)    filter.status = req.query.status;
    if (req.query.date)      filter.booking_date = req.query.date;
    if (req.query.from_date && req.query.to_date)
      filter.booking_date = { $gte: req.query.from_date, $lte: req.query.to_date };

    const bookings = await Booking.find(filter).sort({ booking_date: -1, start_time: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/:id
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bookings → Create booking
router.post("/", async (req, res) => {
  try {
    const {
      customer_name, customer_phone, customer_email,
      booking_date, start_time,
      services_list, barber, amount, notes,
      duration_minutes,
    } = req.body;

    // Real duration from selected services (e.g. Haircut 30 + Beard 20 = 50 min)
    // This is what makes slot blocking accurate - NOT a fixed 60 min block
    const actualDuration = duration_minutes && duration_minutes > 0
      ? duration_minutes
      : FALLBACK_DURATION;

    const end_time = Booking.calcEndTime(start_time, actualDuration);

    // Overlap check
    const conflict = await Booking.checkOverlap(booking_date, start_time, end_time);
    if (conflict) {
      return res.status(400).json({
        error: `Time conflict! ${conflict.customer_name} already has a booking from ${conflict.start_time} to ${conflict.end_time}. Please choose a different time.`,
      });
    }

    const booking = await Booking.create({
      customer_name,
      customer_phone,
      customer_email: customer_email || "",
      services_list:  services_list || [],
      barber:         barber || "No Preference",
      booking_date,
      start_time,
      end_time,
      duration_minutes: actualDuration,
      amount,
      notes: notes || "",
    });

    res.status(201).json(booking);

    // 🔔 Notify admin on Telegram with action buttons - fire and forget
    // If Telegram is down/misconfigured, booking still succeeds normally.
    notifyNewBooking(booking)
      .then(async (messageId) => {
        if (messageId) {
          booking.telegram_message_id = messageId;
          await booking.save();
        }
      })
      .catch(err => console.error("Telegram notify error:", err.message));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/status → Status update (Admin)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "completed", "cancelled"].includes(status))
      return res.status(400).json({ error: "Use: pending, completed, cancelled" });

    const booking = await Booking.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    res.json(booking);

    // Keep Telegram message in sync when status changed from the dashboard
    if (booking.telegram_message_id) {
      updateBookingMessage(booking.telegram_message_id, booking).catch(err =>
        console.error("Telegram sync error:", err.message)
      );
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/bookings/:id
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json({ message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;