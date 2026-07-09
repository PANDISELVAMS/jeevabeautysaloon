// ═══════════════════════════════════════════════════════════════
//  JEEVA BEAUTY SALON — React API Integration
//  Copy this file to unoda React project: src/api.js
// ═══════════════════════════════════════════════════════════════
//
//  .env file la itha add pannu:
//  REACT_APP_API_URL=https://your-railway-app.railway.app
//
// ═══════════════════════════════════════════════════════════════

import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});
// ── PACKAGES ─────────────────────────────────────────────────────────────────

// Booking form la - active packages mattum show panna
export const getActivePackages = () => API.get("/packages?active=true");

// Admin panel - all packages (active + inactive)
export const getAllPackages = () => API.get("/packages");

// Admin - new package add panna
// data: { name, description, price, duration_minutes, is_active }
export const createPackage = (data) => API.post("/packages", data);

// Admin - package edit panna
export const updatePackage = (id, data) => API.put(`/packages/${id}`, data);

// Admin - package delete panna
export const deletePackage = (id) => API.delete(`/packages/${id}`);


// ── BOOKING FORM ──────────────────────────────────────────────────────────────

// Date select pannum pothu call pannu - busy time show panna
// Returns: { date, busy_slots: [{start, end, booked_by}] }
export const getBusyTimes = (date) => API.get(`/busy?date=${date}`);

// New booking create panna
// data: { customer_name, customer_phone, customer_email?, package (id), booking_date, start_time, notes? }
// end_time + amount → backend auto calculate pannudu
export const createBooking = (data) => API.post("/bookings", data);


// ── ADMIN PANEL - BOOKINGS ────────────────────────────────────────────────────

// All bookings - filters optional
// params examples: { status: "pending" } | { date: "2024-12-25" } | { from_date, to_date }
export const getBookings = (params = {}) => API.get("/bookings", { params });

// Single booking
export const getBooking = (id) => API.get(`/bookings/${id}`);

// Status update (Admin - pending / completed / cancelled button click)
// status freed automatically when "cancelled"
export const updateBookingStatus = (id, status) =>
  API.patch(`/bookings/${id}/status`, { status });

// Full booking update (if admin wants to edit details)
export const updateBooking = (id, data) => API.patch(`/bookings/${id}`, data);

// Delete booking
export const deleteBooking = (id) => API.delete(`/bookings/${id}`);


// ── ADMIN DASHBOARD ───────────────────────────────────────────────────────────

// All stats in one call - dashboard home page la use pannu
// Returns:
// {
//   bookings: { total, pending, completed, cancelled },
//   revenue: { today, total },
//   today_bookings: number,
//   daily_revenue: [{ date, day, revenue, bookings }],  ← last 7 days chart data
//   package_stats: [{ name, price, completed_bookings, total_revenue }]
// }
export const getDashboardStats = () => API.get("/dashboard");
