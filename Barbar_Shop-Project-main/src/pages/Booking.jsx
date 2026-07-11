import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { useReveal } from '../hooks/useReveal'
import { barbers } from '../data/barbers'
import { services } from '../data/services'
import { X, Check, ChevronRight, ShoppingBag } from 'lucide-react'
import { addDays, addMonths, isSunday, isAfter, startOfToday } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL // https://jeeva-salon.onrender.com

const TIME_SLOTS = [
  '9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM',
  '3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM',
  '6:00 PM','6:30 PM','7:00 PM','7:30 PM',
]

// "9:30 AM" → "09:30" (backend HH:MM format)
const toBackendTime = (displayTime) => {
  const [time, meridiem] = displayTime.split(' ')
  let [hours, minutes] = time.split(':').map(Number)
  if (meridiem === 'PM' && hours !== 12) hours += 12
  if (meridiem === 'AM' && hours === 12) hours = 0
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

// "2024-12-25" format for backend
const toBackendDate = (dateObj) => {
  return dateObj.toISOString().slice(0, 10)
}

// "9:30 AM" → total minutes since midnight (for overlap math)
const toMinutes = (displayTime) => {
  const [time, mer] = displayTime.split(' ')
  let [h, m] = time.split(':').map(Number)
  if (mer === 'PM' && h !== 12) h += 12
  if (mer === 'AM' && h === 12) h = 0
  return h * 60 + m
}

// Parses service.duration string ("30 min", "45 mins", "1 hr", "1 hr 15 min") → minutes
// Falls back to 30 mins if it can't parse anything
const parseDurationToMinutes = (durationStr) => {
  if (!durationStr) return 30
  const str = String(durationStr).toLowerCase()
  const hrMatch  = str.match(/(\d+)\s*hr/)
  const minMatch = str.match(/(\d+)\s*min/)
  let total = 0
  if (hrMatch)  total += parseInt(hrMatch[1]) * 60
  if (minMatch) total += parseInt(minMatch[1])
  if (!hrMatch && !minMatch) {
    const num = parseInt(str)
    if (!isNaN(num)) total = num
  }
  return total > 0 ? total : 30
}

// "14:30" (24hr) → "2:30 PM" (for showing busy ranges to customer)
const to12Hour = (time24) => {
  const [h, m] = time24.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

// Checks if a given date is today's date (compares Y/M/D only, ignores time)
const isSameDay = (dateA, dateB) => {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  )
}

const STEP_LABELS = ['Services', 'Barber', 'Date & Time', 'Your Details', 'Confirm']

export default function Booking() {
  const { cart, addToCart, removeFromCart, cartTotal, clearCart } = useApp()
  const navigate = useNavigate()
  const headRef = useReveal()

  const [step, setStep]                   = useState(0)
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [selectedDate, setSelectedDate]   = useState(null)
  const [selectedTime, setSelectedTime]   = useState(null)
  const [form, setForm]                   = useState({ name: '', phone: '', email: '', notes: '' })
  const [confirmed, setConfirmed]         = useState(null)
  const [busySlots, setBusySlots]         = useState([])   // blocked time ranges from backend
  const [submitting, setSubmitting]       = useState(false)
  const [blockedDates, setBlockedDates]   = useState([])   // admin leave days - "YYYY-MM-DD" strings

  // Fetch admin-marked leave days once when this page loads
  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const res = await fetch(`${API_URL}/api/blocked-dates`)
        const data = await res.json()
        setBlockedDates(data.map(d => d.date)) // just the date strings
      } catch (err) {
        console.error('Could not fetch blocked dates:', err)
      }
    }
    fetchBlockedDates()
  }, [])

  // Total duration of all selected services (e.g. Haircut 30min + Beard 20min = 50min)
  // This is THE key value used to correctly block/free time slots
  const cartTotalDuration = cart.reduce(
    (sum, s) => sum + parseDurationToMinutes(s.duration), 0
  ) || 30 // fallback minimum 30 min if nothing parses

  const handleFormChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  // ── When date is selected → fetch busy slots from backend ─────────────────
  const handleDateChange = async (date) => {
    setSelectedDate(date)
    setSelectedTime(null)
    try {
      const dateStr = toBackendDate(date)
      const res = await fetch(`${API_URL}/api/busy?date=${dateStr}`)
      const data = await res.json()
      setBusySlots(data.busy_slots || [])
    } catch (err) {
      console.error('Could not fetch busy slots:', err)
      setBusySlots([])
    }
  }

  // ── Check if picking THIS slot would overlap any existing booking ─────────
  // Correct logic: block a slot only if [slotStart, slotStart+duration)
  // actually overlaps a busy range. A 30-min service ending exactly when
  // a slot starts (or starting exactly when a busy slot ends) is FREE.
  const isSlotBusy = (displayTime) => {
    const slotStart = toMinutes(displayTime)
    const slotEnd    = slotStart + cartTotalDuration

    return busySlots.some(({ start, end }) => {
      const [sh, sm] = start.split(':').map(Number)
      const [eh, em] = end.split(':').map(Number)
      const busyStart = sh * 60 + sm
      const busyEnd    = eh * 60 + em
      // Standard overlap check
      return slotStart < busyEnd && slotEnd > busyStart
    })
  }

  // ── Check if THIS slot has already passed (only relevant for today's date) ─
  // If customer picked today and it's currently 4:50 PM, then 1:00 PM, 4:00 PM
  // etc should be disabled - can't book a time that's already gone.
  // Small 10-min buffer so we don't allow booking a slot that's about to start.
  const isSlotInPast = (displayTime) => {
    if (!selectedDate) return false
    const now = new Date()
    if (!isSameDay(selectedDate, now)) return false // only applies to today

    const nowMinutes  = now.getHours() * 60 + now.getMinutes() + 10 // 10-min buffer
    const slotMinutes = toMinutes(displayTime)
    return slotMinutes < nowMinutes
  }

  const canProceed = () => {
    if (step === 0) return cart.length > 0
    if (step === 1) return selectedBarber !== null
    if (step === 2) return selectedDate && selectedTime
    if (step === 3) return form.name.trim() && form.phone.trim()
    return true
  }

  // ── Submit booking to backend ─────────────────────────────────────────────
  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      // Services → we save as notes since backend has single package
      // Combined service names as a string in notes
      const serviceNames  = cart.map(s => s.name).join(', ')
      const backendDate   = toBackendDate(selectedDate)
      const backendTime   = toBackendTime(selectedTime)
      const displayDate   = selectedDate.toLocaleDateString('en-IN', {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
      })

      // ── If backend has packages, use first service as package (optional) ──
      // Or send as a "multi-service" booking with total amount
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name:  form.name.trim(),
          customer_phone: form.phone.trim(),
          customer_email: form.email.trim(),
          booking_date:   backendDate,
          start_time:     backendTime,
          barber:         selectedBarber,
          amount:         cartTotal,
          notes:          [
            `Services: ${serviceNames}`,
            form.notes ? `Request: ${form.notes}` : ''
          ].filter(Boolean).join(' | '),
          services_list:    cart.map(s => s.name),
          duration_minutes: cartTotalDuration, // ← actual service duration, not a fixed default
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Overlap / conflict error from backend
        toast.error(data.error || 'Booking failed. Please try again.')
        setSubmitting(false)
        return
      }

      // ── Success ────────────────────────────────────────────────────────────
      setConfirmed({
        id:       data._id,
        customer: form,
        services: cart.map(s => s.name),
        barber:   selectedBarber,
        date:     displayDate,
        time:     selectedTime,
        total:    cartTotal,
      })
      clearCart()
      toast.success('Appointment confirmed! 🎉')

    } catch (err) {
      toast.error('Network error. Check your connection.')
    } finally {
      setSubmitting(false)
    }
  }

  // Customer can only book within the next 1 month
  const oneMonthFromNow = addMonths(startOfToday(), 1)

  // Sundays closed + admin leave days excluded + must be today or later
  const filterDate = date => {
    const dateStr = toBackendDate(date)
    return (
      isSunday(date) &&
      isAfter(date, addDays(startOfToday(), -1)) &&
      !blockedDates.includes(dateStr) // admin marked this as unavailable
    )
  }

  // ── Confirmation screen ────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-black" />
          </div>
          <h1 className="font-playfair text-4xl font-bold mb-3">Booking Confirmed!</h1>
          <p className="text-cream/50 mb-8 text-sm leading-relaxed">
            Thank you <strong className="text-cream">{confirmed.customer.name}</strong>! Your appointment has been booked.
          </p>
          <div className="bg-black-card border border-black-border p-6 text-left mb-8 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-cream/40 uppercase tracking-[1px] text-[11px]">Booking ID</span>
              <span className="text-gold font-bebas text-lg">#{confirmed.id.toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-black-border pt-3">
              <span className="text-cream/40 uppercase tracking-[1px] text-[11px]">Barber</span>
              <span>{confirmed.barber}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-black-border pt-3">
              <span className="text-cream/40 uppercase tracking-[1px] text-[11px]">Date</span>
              <span>{confirmed.date}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-black-border pt-3">
              <span className="text-cream/40 uppercase tracking-[1px] text-[11px]">Time</span>
              <span>{confirmed.time}</span>
            </div>
            <div className="border-t border-black-border pt-3">
              <span className="text-cream/40 uppercase tracking-[1px] text-[11px]">Services</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {confirmed.services.map((s, i) => (
                  <span key={i} className="bg-black border border-black-border text-xs px-3 py-1 text-cream/70">{s}</span>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-black-border pt-3">
              <span className="text-cream/40 uppercase tracking-[1px] text-[11px]">Total</span>
              <span className="font-bebas text-3xl text-gold">₹{confirmed.total}</span>
            </div>
          </div>
          <a
            href={`https://wa.me/917904616471?text=Hi! I just booked appointment%23${confirmed.id.toString().slice(-6)} for ${confirmed.date} at ${confirmed.time}.`}
            target="_blank" rel="noopener noreferrer"
            className="w-full block bg-[#25D366] text-white text-xs tracking-[2px] uppercase font-semibold py-4 mb-3 hover:bg-[#20bb5a] transition-colors"
          >
            Confirm on WhatsApp
          </a>
          <button
            onClick={() => {
              setConfirmed(null); setStep(0); setSelectedBarber(null)
              setSelectedDate(null); setSelectedTime(null)
              setForm({ name:'', phone:'', email:'', notes:'' })
              navigate('/')
            }}
            className="w-full border border-black-border text-cream/60 text-xs tracking-[2px] uppercase py-4 hover:border-gold/40 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">

        {/* Header */}
        <div ref={headRef} className="reveal mb-10">
          <div className="text-[11px] tracking-[5px] uppercase text-gold mb-2">Reserve Your Spot</div>
          <h1 className="font-playfair text-5xl font-bold">Book Appointment</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-12 overflow-x-auto pb-2">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex items-center shrink-0">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-2 text-[11px] tracking-[1px] uppercase transition-colors ${
                  i === step ? 'text-gold' : i < step ? 'text-cream/50 hover:text-gold cursor-pointer' : 'text-cream/20 cursor-default'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                  i < step ? 'bg-gold border-gold text-black' : i === step ? 'border-gold text-gold' : 'border-white/10 text-cream/20'
                }`}>
                  {i < step ? <Check size={10} /> : i + 1}
                </span>
                <span className="hidden sm:block">{label}</span>
              </button>
              {i < STEP_LABELS.length - 1 && (
                <ChevronRight size={14} className="text-white/10 mx-1 shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 0: SERVICES ── */}
        {step === 0 && (
          <div>
            <h2 className="font-playfair text-2xl font-bold mb-6">Select Services</h2>
            <div className="grid sm:grid-cols-2 gap-[2px] mb-8">
              {services.map(service => (
                <div key={service.id}
                  onClick={() => addToCart(service)}
                  className={`relative cursor-pointer p-5 border transition-all duration-200 ${
                    cart.find(s => s.id === service.id)
                      ? 'border-gold bg-gold/5'
                      : 'border-black-border bg-black-card hover:border-gold/30'
                  }`}>
                  {service.popular && (
                    <span className="absolute top-0 right-0 bg-gold text-black text-[9px] tracking-[1px] uppercase px-2 py-0.5 font-semibold">Popular</span>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">{service.icon}</span>
                      <div>
                        <div className="font-medium text-sm mb-0.5">{service.name}</div>
                        <div className="text-[10px] tracking-[1px] uppercase text-gold/60">{service.category} · {service.duration}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bebas text-xl text-gold">₹{service.price}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        cart.find(s => s.id === service.id) ? 'bg-gold border-gold' : 'border-white/20'
                      }`}>
                        {cart.find(s => s.id === service.id) && <Check size={10} className="text-black" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="bg-black-card border border-gold/20 p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-gold">
                    <ShoppingBag size={14} />
                    <span>Selected ({cart.length})</span>
                  </div>
                  <span className="font-bebas text-2xl text-gold">₹{cartTotal}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cart.map(s => (
                    <span key={s.id} className="inline-flex items-center gap-1 bg-black border border-black-border text-xs px-2 py-1 text-cream/60">
                      {s.name}
                      <button onClick={(e) => { e.stopPropagation(); removeFromCart(s.id) }} className="text-cream/30 hover:text-gold">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 1: BARBER ── */}
        {step === 1 && (
          <div>
            <h2 className="font-playfair text-2xl font-bold mb-6">Choose Your Barber</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[{ id: 0, name: 'No Preference', role: 'Any available stylist', experience: '', speciality: "We'll assign the best available", avatar: '?', image: null }, ...barbers].map(barber => (
                <div key={barber.id}
                  onClick={() => setSelectedBarber(barber.name)}
                  className={`cursor-pointer p-6 border transition-all duration-200 flex items-center gap-5 ${
                    selectedBarber === barber.name
                      ? 'border-gold bg-gold/5'
                      : 'border-black-border bg-black-card hover:border-gold/30'
                  }`}>
                  {barber.image ? (
                    <img src={barber.image} alt={barber.name} className="w-14 h-14 rounded-full object-cover grayscale" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-black-border flex items-center justify-center font-bebas text-2xl text-gold">?</div>
                  )}
                  <div className="flex-1">
                    <div className="font-playfair font-bold text-lg mb-0.5">{barber.name}</div>
                    <div className="text-[11px] tracking-[1px] uppercase text-gold/70 mb-1">{barber.role}</div>
                    {barber.experience
                      ? <div className="text-xs text-cream/40">{barber.experience} · {barber.speciality}</div>
                      : <div className="text-xs text-cream/40">{barber.speciality}</div>
                    }
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    selectedBarber === barber.name ? 'bg-gold border-gold' : 'border-white/20'
                  }`}>
                    {selectedBarber === barber.name && <Check size={10} className="text-black" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: DATE & TIME ── */}
        {step === 2 && (
          <div>
            <h2 className="font-playfair text-2xl font-bold mb-6">Pick Date & Time</h2>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="text-[11px] tracking-[2px] uppercase text-cream/40 mb-3">Select Date</div>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  filterDate={filterDate}
                  minDate={new Date()}
                  maxDate={oneMonthFromNow}
                  inline
                />
                <p className="text-[11px] text-cream/30 mt-3">
                  * Closed on Sundays · Bookings open up to 1 month ahead · Greyed dates are admin leave days
                </p>
              </div>
              <div>
                <div className="text-[11px] tracking-[2px] uppercase text-cream/40 mb-3">
                  Select Time {selectedDate && `— ${selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}`}
                </div>

                {selectedDate ? (
                  <>
                    <p className="text-[11px] text-cream/30 mb-3">
                      Your service takes <span className="text-gold">{cartTotalDuration} mins</span>.
                      {isSameDay(selectedDate, new Date())
                        ? ' Greyed slots are either already booked or already passed.'
                        : " Greyed slots don't have enough free time."}
                    </p>

                    <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1 mb-4">
                      {TIME_SLOTS.map(time => {
                        const busy = isSlotBusy(time)
                        const past = isSlotInPast(time)
                        const disabled = busy || past
                        return (
                          <button
                            key={time}
                            onClick={() => !disabled && setSelectedTime(time)}
                            disabled={disabled}
                            title={past ? 'This time has already passed' : busy ? 'Already booked' : ''}
                            className={`py-2 text-xs tracking-[1px] border transition-colors ${
                              disabled
                                ? 'border-black-border text-cream/20 bg-black-card cursor-not-allowed line-through'
                                : selectedTime === time
                                  ? 'bg-gold text-black border-gold font-semibold'
                                  : 'border-black-border text-cream/60 hover:border-gold/40 bg-black-card'
                            }`}
                          >
                            {time}
                          </button>
                        )
                      })}
                    </div>

                    {/* Already-booked ranges for this date - times only, no customer names (privacy) */}
                    {busySlots.length > 0 && (
                      <div className="bg-black-card border border-black-border p-4">
                        <div className="text-[10px] tracking-[2px] uppercase text-cream/40 mb-2">
                          Already Booked Today
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {busySlots
                            .slice()
                            .sort((a, b) => a.start.localeCompare(b.start))
                            .map((slot, i) => (
                              <span
                                key={i}
                                className="text-xs text-cream/50 bg-black border border-black-border px-2 py-1"
                              >
                                {to12Hour(slot.start)} – {to12Hour(slot.end)}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="border border-dashed border-black-border p-8 text-center text-cream/30 text-sm">
                    Pick a date first
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: DETAILS ── */}
        {step === 3 && (
          <div>
            <h2 className="font-playfair text-2xl font-bold mb-6">Your Details</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-[11px] tracking-[2px] uppercase text-cream/40 mb-2">Full Name *</label>
                <input name="name" value={form.name} onChange={handleFormChange} placeholder="Karthik Rajan"
                  className="w-full bg-black-card border border-black-border text-cream px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-cream/20" />
              </div>
              <div>
                <label className="block text-[11px] tracking-[2px] uppercase text-cream/40 mb-2">Phone Number *</label>
                <input name="phone" value={form.phone} onChange={handleFormChange} placeholder="+91 98765 43210" type="tel"
                  className="w-full bg-black-card border border-black-border text-cream px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-cream/20" />
              </div>
              <div>
                <label className="block text-[11px] tracking-[2px] uppercase text-cream/40 mb-2">Email (optional)</label>
                <input name="email" value={form.email} onChange={handleFormChange} placeholder="karthik@email.com" type="email"
                  className="w-full bg-black-card border border-black-border text-cream px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-cream/20" />
              </div>
              <div>
                <label className="block text-[11px] tracking-[2px] uppercase text-cream/40 mb-2">Special Requests</label>
                <input name="notes" value={form.notes} onChange={handleFormChange} placeholder="Any specific requests..."
                  className="w-full bg-black-card border border-black-border text-cream px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors placeholder:text-cream/20" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: CONFIRM ── */}
        {step === 4 && (
          <div>
            <h2 className="font-playfair text-2xl font-bold mb-6">Review & Confirm</h2>
            <div className="bg-black-card border border-black-border p-6 mb-8 space-y-4">
              <div className="flex justify-between text-sm border-b border-black-border pb-4">
                <span className="text-cream/40 uppercase tracking-[1px] text-[11px]">Customer</span>
                <div className="text-right">
                  <div>{form.name}</div>
                  <div className="text-cream/50 text-xs">{form.phone}</div>
                </div>
              </div>
              <div className="flex justify-between text-sm border-b border-black-border pb-4">
                <span className="text-cream/40 uppercase tracking-[1px] text-[11px]">Barber</span>
                <span>{selectedBarber}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-black-border pb-4">
                <span className="text-cream/40 uppercase tracking-[1px] text-[11px]">Date & Time</span>
                <div className="text-right">
                  <div>{selectedDate?.toLocaleDateString('en-IN', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })}</div>
                  <div className="text-gold">{selectedTime}</div>
                </div>
              </div>
              <div className="border-b border-black-border pb-4">
                <div className="text-cream/40 uppercase tracking-[1px] text-[11px] mb-3">Services</div>
                <div className="space-y-2">
                  {cart.map(s => (
                    <div key={s.id} className="flex justify-between text-sm">
                      <span className="text-cream/70">{s.icon} {s.name}</span>
                      <span className="text-gold font-bebas text-base">₹{s.price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cream/40 uppercase tracking-[1px] text-[11px]">Total</span>
                <span className="font-bebas text-4xl text-gold">₹{cartTotal}</span>
              </div>
              {form.notes && (
                <div className="border-t border-black-border pt-4">
                  <span className="text-cream/40 uppercase tracking-[1px] text-[11px]">Notes: </span>
                  <span className="text-sm text-cream/60">{form.notes}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="flex justify-between items-center gap-4 mt-4">
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)}
              className="border border-black-border text-cream/60 px-6 py-3 text-xs tracking-[2px] uppercase hover:border-gold/40 transition-colors">
              ← Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => canProceed() && setStep(s => s + 1)}
              className={`px-8 py-3 text-xs tracking-[3px] uppercase font-semibold transition-colors inline-flex items-center gap-2 ${
                canProceed()
                  ? 'bg-gold text-black hover:bg-gold-light'
                  : 'bg-black-border text-cream/20 cursor-not-allowed'
              }`}>
              {step === 3 ? 'Review Booking' : 'Continue'} <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className={`px-10 py-3 text-xs tracking-[3px] uppercase font-semibold inline-flex items-center gap-2 transition-colors ${
                submitting
                  ? 'bg-gold/50 text-black cursor-not-allowed'
                  : 'bg-gold text-black hover:bg-gold-light'
              }`}>
              {submitting ? 'Saving...' : <><Check size={14} /> Confirm Booking</>}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}