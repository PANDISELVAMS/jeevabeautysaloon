require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");

const packageRoutes   = require("./routes/packages");
const bookingRoutes   = require("./routes/bookings");
const dashboardRoutes = require("./routes/dashboard");
const Booking         = require("./models/Booking");

const app  = express();
const PORT = process.env.PORT || 5000;


// ── CORS ──────────────────────────────────────────────────────────────────────
// CORS_ORIGIN env variable la unoda Vercel URL pottu
// Example: CORS_ORIGIN=https://jeeva-salon.vercel.app
const allowedOrigins = ["http://localhost:5173"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
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
app.use("/api",          dashboardRoutes); // /api/dashboard + /api/busy

// Health check
app.get("/", (req, res) => res.json({ status: "Jeeva Salon API running ✅" }));

// ── Auto-delete: 7 days pana bookings delete ──────────────────────────────────
// Every Sunday 12:30 AM IST = Sunday 7:00 PM UTC
// Cron format: minute hour day month weekday
cron.schedule("0 19 * * 0", async () => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const result = await Booking.deleteMany({ createdAt: { $lt: cutoff } });
    console.log(`🗑️  Auto-deleted ${result.deletedCount} bookings older than 7 days`);
  } catch (err) {
    console.error("Auto-delete error:", err.message);
  }
}, {
  timezone: "Asia/Kolkata",
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Jeeva Salon Backend running on port ${PORT}`);
});
