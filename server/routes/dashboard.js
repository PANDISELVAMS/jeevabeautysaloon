const express = require("express");
const router  = express.Router();
const Booking = require("../models/Booking");

// GET /api/busy?date=2024-12-25
// SECURITY: only returns start/end times - never exposes customer_name
// This endpoint is public (anyone on the booking page can call it)
router.get("/busy", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: "date param required" });

    const bookings = await Booking.find({
      booking_date: date,
      status: { $in: ["pending", "completed"] },
    }).select("start_time end_time -_id"); // customer_name NOT selected

    res.json({
      date,
      busy_slots: bookings.map(b => ({
        start: b.start_time,
        end:   b.end_time,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    // Today IST
    const istNow  = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
    const today   = istNow.toISOString().slice(0, 10);

    const [total, pending, completed, cancelled] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({ status: "cancelled" }),
    ]);

    const todayDocs     = await Booking.find({ booking_date: today });
    const today_count   = todayDocs.length;
    const today_revenue = todayDocs
      .filter(b => b.status === "completed")
      .reduce((s, b) => s + b.amount, 0);

    const allCompleted  = await Booking.find({ status: "completed" });
    const total_revenue = allCompleted.reduce((s, b) => s + b.amount, 0);

    // Last 7 days daily revenue
    const daily_revenue = [];
    for (let i = 6; i >= 0; i--) {
      const d    = new Date(istNow);
      d.setDate(d.getDate() - i);
      const ds   = d.toISOString().slice(0, 10);
      const day  = d.toLocaleDateString("en-US", { weekday: "short" });
      const docs = await Booking.find({ booking_date: ds });
      const rev  = docs.filter(b => b.status === "completed").reduce((s, b) => s + b.amount, 0);
      daily_revenue.push({ date: ds, day, revenue: rev, bookings: docs.length });
    }

    // Barber-wise stats
    const barberMap = {};
    allCompleted.forEach(b => {
      const name = b.barber || "No Preference";
      if (!barberMap[name]) barberMap[name] = { bookings: 0, revenue: 0 };
      barberMap[name].bookings++;
      barberMap[name].revenue += b.amount;
    });
    const barber_stats = Object.entries(barberMap).map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue);

    res.json({
      bookings:       { total, pending, completed, cancelled },
      revenue:        { today: today_revenue, total: total_revenue },
      today_bookings: today_count,
      daily_revenue,
      barber_stats,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;