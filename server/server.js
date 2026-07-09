const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "http://localhost:5173,https://jeevabeauty-saloon.vercel.app"
)
.split(",")
.map(origin => origin.trim());

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked Origin:", origin);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
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
