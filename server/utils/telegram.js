// ── Telegram notification helper ──────────────────────────────────────────────
// Sends a message to the admin's Telegram whenever a new booking is created.
// Uses Node's built-in fetch (Node 18+, available on Railway & Render by default).

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

/**
 * Sends a plain text message to the configured admin Telegram chat.
 * Never throws - logs errors instead, so a Telegram failure never
 * blocks or breaks the booking flow.
 */
async function sendTelegramMessage(text) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("⚠️  Telegram not configured (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing) - skipping notification");
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("Telegram send failed:", data.description);
    }
  } catch (err) {
    console.error("Telegram send error:", err.message);
  }
}

/**
 * Formats and sends a "new booking" notification.
 */
async function notifyNewBooking(booking) {
  const servicesText = booking.services_list?.length
    ? booking.services_list.join(", ")
    : "N/A";

  const message =
    `🔔 <b>New Booking Received!</b>\n\n` +
    `👤 <b>Customer:</b> ${booking.customer_name}\n` +
    `📞 <b>Phone:</b> ${booking.customer_phone}\n` +
    `💇 <b>Services:</b> ${servicesText}\n` +
    `✂️ <b>Barber:</b> ${booking.barber || "No Preference"}\n` +
    `📅 <b>Date:</b> ${booking.booking_date}\n` +
    `⏰ <b>Time:</b> ${booking.start_time} - ${booking.end_time}\n` +
    `💰 <b>Amount:</b> ₹${booking.amount}\n` +
    (booking.notes ? `📝 <b>Notes:</b> ${booking.notes}\n` : "") +
    `\n📋 Status: <i>Pending</i>`;

  await sendTelegramMessage(message);
}

module.exports = { sendTelegramMessage, notifyNewBooking };