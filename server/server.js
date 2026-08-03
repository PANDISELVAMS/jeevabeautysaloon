require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");

const packageRoutes     = require("./routes/packages");
const bookingRoutes     = require("./routes/bookings");
const dashboardRoutes   = require("./routes/dashboard");
const telegramWebhook   = require("./routes/telegramWebhook");
const blockedDateRoutes = require("./routes/blockedDates");
const Booking           = require("./models/Booking");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
// CORS_ORIGIN env variable la unoda Vercel URL pottu
// Example: CORS_ORIGIN=https://jeevasaloon.vercel.app
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// ── MongoDB connect ───────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/packages", packageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api",              dashboardRoutes);   // /api/dashboard + /api/busy
app.use("/api/telegram",     telegramWebhook);   // /api/telegram/webhook
app.use("/api/blocked-dates", blockedDateRoutes); // admin leave days

// Health check
app.get("/", (req, res) => res.json({ status: "Jeeva Salon API running ✅" }));

// ── Auto-delete logic (reusable) ────────────────────────────────────────────
// Deletes bookings older than 7 days. Called by BOTH the internal cron
// (works only while the server is awake) AND the external /api/cleanup
// endpoint below (works even if Render's free tier put the server to sleep -
// an external ping wakes it up and triggers this).
async function cleanupOldBookings() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const result = await Booking.deleteMany({ createdAt: { $lt: cutoff } });
  console.log(`🗑️  Auto-deleted ${result.deletedCount} bookings older than 7 days`);
  return result.deletedCount;
}

// ── GET /api/cleanup?secret=XXX ─────────────────────────────────────────────
// Public but secret-protected endpoint. Set up a free external cron
// (cron-job.org) to hit this URL every Sunday - this is what actually
// guarantees deletion happens, since Render free tier sleeps the server
// and the internal cron.schedule() below only works while it's awake.
app.get("/api/cleanup", async (req, res) => {
  if (req.query.secret !== process.env.CLEANUP_SECRET) {
    return res.status(403).json({ error: "Invalid secret" });
  }
  try {
    const deletedCount = await cleanupOldBookings();
    res.json({ ok: true, deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Internal cron - works ONLY when server happens to be awake at that time ──
// Kept as a backup in case the server is awake anyway (e.g. active traffic).
// Every Sunday 12:00 AM IST (midnight)
cron.schedule("0 0 * * 0", () => {
  cleanupOldBookings().catch(err => console.error("Auto-delete error:", err.message));
}, {
  timezone: "Asia/Kolkata",
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Jeeva Salon Backend running on port ${PORT}`);
});