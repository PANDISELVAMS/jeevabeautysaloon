const express = require("express");
const router  = express.Router();
const Booking = require("../models/Booking");
const { answerCallbackQuery, updateBookingMessage } = require("../utils/telegram");

// ── POST /api/telegram/webhook ────────────────────────────────────────────────
// Telegram calls THIS url whenever admin presses a button on a booking message.
// callback_data looks like "completed:<bookingId>" / "cancelled:<bookingId>" / "pending:<bookingId>"
router.post("/webhook", async (req, res) => {
  try {
    const callback = req.body.callback_query;

    // Not a button press (could be a regular message) - just acknowledge and ignore
    if (!callback) {
      return res.sendStatus(200);
    }

    const [status, bookingId] = callback.data.split(":");

    if (!["pending", "completed", "cancelled"].includes(status)) {
      await answerCallbackQuery(callback.id, "Unknown action");
      return res.sendStatus(200);
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );

    if (!booking) {
      await answerCallbackQuery(callback.id, "Booking not found (maybe deleted)");
      return res.sendStatus(200);
    }

    // Acknowledge the button press (removes Telegram's loading spinner)
    await answerCallbackQuery(callback.id, `Status updated to ${status} ✅`);

    // Edit the Telegram message to show the new status
    await updateBookingMessage(callback.message.message_id, booking);

    // NOTE: Nothing else needed here - the admin dashboard reads straight
    // from MongoDB, so it will show the updated status on its next fetch.

    res.sendStatus(200);
  } catch (err) {
    console.error("Telegram webhook error:", err.message);
    res.sendStatus(200); // always 200 so Telegram doesn't retry endlessly
  }
});

module.exports = router;
