require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");

const packageRoutes = require("./routes/packages");
const bookingRoutes = require("./routes/bookings");
const dashboardRoutes = require("./routes/dashboard");
const Booking = require("./models/Booking");

const app = express();
const PORT = process.env.PORT || 5000;

// ===================== CORS ======================

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "https://jeevabeauty-saloon.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim());

const corsOptions = {
  origin: (origin, callback) => {
    console.log("Incoming Origin:", origin);

    // Postman / server-to-server requests
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked Origin:", origin);
    return callback(new Error(`CORS blocked: ${origin}`));
  },

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

// ===================== MongoDB ======================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.log("MongoDB Error:", err.message);
    process.exit(1);
  });

// ===================== Routes ======================

app.use("/api/packages", packageRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api", dashboardRoutes);

// ===================== Home ======================

app.get("/", (req, res) => {
  res.json({
    status: "Jeeva Salon API running ✅",
  });
});

// ===================== Auto Delete ======================

cron.schedule(
  "0 19 * * 0",
  async () => {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);

      const result = await Booking.deleteMany({
        createdAt: {
          $lt: cutoff,
        },
      });

      console.log(
        `Deleted ${result.deletedCount} bookings older than 7 days`
      );
    } catch (err) {
      console.log(err.message);
    }
  },
  {
    timezone: "Asia/Kolkata",
  }
);

// ===================== Server ======================

app.listen(PORT, () => {
  console.log(`🚀 Server Running on Port ${PORT}`);
});