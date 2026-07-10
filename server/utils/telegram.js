// ── Telegram notification helper ──────────────────────────────────────────────
// Sends a message to the admin's Telegram whenever a new booking is created.
// Includes inline buttons so admin can update status directly from Telegram -
// that update writes to MongoDB, which the admin dashboard reads from too.
// Uses Node's built-in fetch (Node 18+, available on Railway & Render by default).

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;
const API_BASE  = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * Low-level Telegram API caller. Never throws - logs and returns null on failure.
 */
async function callTelegram(method, payload) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn("⚠️  Telegram not configured - skipping", method);
    return null;
  }
  try {
    const res = await fetch(`${API_BASE}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!data.ok) console.error(`Telegram ${method} failed:`, data.description);
    return data;
  } catch (err) {
    console.error(`Telegram ${method} error:`, err.message);
    return null;
  }
}

/** Plain text message (no buttons) */
async function sendTelegramMessage(text) {
  return callTelegram("sendMessage", { chat_id: CHAT_ID, text, parse_mode: "HTML" });
}

/** Edits an existing message's text + buttons */
async function editTelegramMessage(message_id, text, replyMarkup = null) {
  return callTelegram("editMessageText", {
    chat_id: CHAT_ID,
    message_id,
    text,
    parse_mode: "HTML",
    ...(replyMarkup && { reply_markup: replyMarkup }),
  });
}

/** Acknowledges a button press so Telegram stops showing the loading spinner */
async function answerCallbackQuery(callback_query_id, text = "") {
  return callTelegram("answerCallbackQuery", { callback_query_id, text });
}

/** Builds the status text + button label for a booking */
function statusEmoji(status) {
  return { pending: "🟡 Pending", completed: "🟢 Completed", cancelled: "🔴 Cancelled" }[status] || status;
}

function buildBookingMessage(booking) {
  const servicesText = booking.services_list?.length ? booking.services_list.join(", ") : "N/A";
  return (
    `🔔 <b>Booking</b>\n\n` +
    `👤 <b>Customer:</b> ${booking.customer_name}\n` +
    `📞 <b>Phone:</b> ${booking.customer_phone}\n` +
    `💇 <b>Services:</b> ${servicesText}\n` +
    `✂️ <b>Barber:</b> ${booking.barber || "No Preference"}\n` +
    `📅 <b>Date:</b> ${booking.booking_date}\n` +
    `⏰ <b>Time:</b> ${booking.start_time} - ${booking.end_time}\n` +
    `💰 <b>Amount:</b> ₹${booking.amount}\n` +
    (booking.notes ? `📝 <b>Notes:</b> ${booking.notes}\n` : "") +
    `\n📋 <b>Status:</b> ${statusEmoji(booking.status)}`
  );
}

/** Inline buttons - callback_data encodes action:bookingId so the webhook knows what to do */
function buildStatusButtons(bookingId) {
  return {
    inline_keyboard: [
      [
        { text: "✅ Mark Completed", callback_data: `completed:${bookingId}` },
        { text: "❌ Cancel",         callback_data: `cancelled:${bookingId}` },
      ],
      [
        { text: "🟡 Set Pending", callback_data: `pending:${bookingId}` },
      ],
    ],
  };
}

/**
 * Sends the "new booking" notification WITH action buttons.
 * Returns the Telegram message_id so we can edit it later (stored on the booking).
 */
async function notifyNewBooking(booking) {
  const text = buildBookingMessage(booking);
  const result = await callTelegram("sendMessage", {
    chat_id: CHAT_ID,
    text,
    parse_mode: "HTML",
    reply_markup: buildStatusButtons(booking._id),
  });
  return result?.result?.message_id || null; // save this on the booking doc
}

/**
 * Called from the webhook when admin taps a button in Telegram.
 * Updates the message text/status label to reflect the new state.
 */
async function updateBookingMessage(message_id, booking) {
  const text = buildBookingMessage(booking);
  await editTelegramMessage(message_id, text, buildStatusButtons(booking._id));
}

module.exports = {
  sendTelegramMessage,
  notifyNewBooking,
  updateBookingMessage,
  answerCallbackQuery,
};