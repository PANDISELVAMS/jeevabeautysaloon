import { useState, useEffect } from 'react'
import { LogIn, LogOut, CheckCircle, Clock, XCircle, BarChart2, Users, Calendar, IndianRupee, CalendarX, Trash2, Plus } from 'lucide-react'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'change_me_in_vercel'
const API_URL = import.meta.env.VITE_API_URL // e.g. https://jeeva-salon.onrender.com

const STATUS_STYLES = {
  confirmed:  'text-green-400 bg-green-400/10 border-green-400/20',
  pending:    'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  cancelled:  'text-red-400 bg-red-400/10 border-red-400/20',
  completed:  'text-blue-400 bg-blue-400/10 border-blue-400/20',
}

const STATUS_ICON = {
  confirmed: <CheckCircle size={11} />,
  pending:   <Clock size={11} />,
  cancelled: <XCircle size={11} />,
  completed: <CheckCircle size={11} />,
}

export default function Admin() {
  const [authed, setAuthed]     = useState(false)
  const [pw, setPw]             = useState('')
  const [pwError, setPwError]   = useState(false)
  const [filter, setFilter]     = useState('all')
  const [bookings, setBookings] = useState([])
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  // ── Leave days state ────────────────────────────────────────────────────────
  const [blockedDates, setBlockedDates]   = useState([])
  const [newLeaveDate, setNewLeaveDate]   = useState('')
  const [newLeaveReason, setNewLeaveReason] = useState('')
  const [blockType, setBlockType]         = useState('full')   // 'full' or 'time'
  const [newStartTime, setNewStartTime]   = useState('')
  const [newEndTime, setNewEndTime]       = useState('')
  const [leaveSaving, setLeaveSaving]     = useState(false)

  // ── Fetch bookings from backend ──────────────────────────────────────────
  const fetchBookings = async (statusFilter = 'all') => {
    setLoading(true)
    setError(null)
    try {
      const url = statusFilter === 'all'
        ? `${API_URL}/api/bookings`
        : `${API_URL}/api/bookings?status=${statusFilter}`
      const res = await fetch(url)
      const data = await res.json()
      setBookings(data)
    } catch (err) {
      setError('Backend connect aagalai. API URL check pannu.')
    } finally {
      setLoading(false)
    }
  }

  // ── Fetch dashboard stats ─────────────────────────────────────────────────
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dashboard`)
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Stats fetch error:', err)
    }
  }

  // ── Fetch blocked / leave dates ─────────────────────────────────────────────
  const fetchBlockedDates = async () => {
    try {
      const res = await fetch(`${API_URL}/api/blocked-dates`)
      const data = await res.json()
      setBlockedDates(data)
    } catch (err) {
      console.error('Blocked dates fetch error:', err)
    }
  }

  // ── On login success → load data ──────────────────────────────────────────
  useEffect(() => {
    if (authed) {
      fetchBookings(filter)
      fetchStats()
      fetchBlockedDates()
    }
  }, [authed])

  // ── Filter change → refetch ───────────────────────────────────────────────
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    fetchBookings(newFilter)
  }

  // ── Update booking status ─────────────────────────────────────────────────
  const updateBookingStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Status update failed')

      setBookings(prev =>
        prev.map(b => b._id === id ? { ...b, status: newStatus } : b)
      )
      fetchStats()
    } catch (err) {
      alert('Status update aagalai. Try again.')
    }
  }

  // ── Add a leave day / time-block (blocks that date or time on booking page) ──
  const addLeaveDate = async (e) => {
    e.preventDefault()
    if (!newLeaveDate) return
    if (blockType === 'time' && (!newStartTime || !newEndTime)) {
      alert('Start time and end time rendayume kudukanum')
      return
    }

    setLeaveSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/blocked-dates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newLeaveDate,
          reason: newLeaveReason,
          ...(blockType === 'time' && { start_time: newStartTime, end_time: newEndTime }),
        }),
      })
      if (!res.ok) throw new Error('Failed')

      setNewLeaveDate('')
      setNewLeaveReason('')
      setNewStartTime('')
      setNewEndTime('')
      fetchBlockedDates()
    } catch (err) {
      alert('Leave date add aagalai. Try again.')
    } finally {
      setLeaveSaving(false)
    }
  }

  // ── Remove a leave day (customer can book that date again) ─────────────────
  const removeLeaveDate = async (id) => {
    try {
      await fetch(`${API_URL}/api/blocked-dates/${id}`, { method: 'DELETE' })
      setBlockedDates(prev => prev.filter(d => d._id !== id))
    } catch (err) {
      alert('Remove aagalai. Try again.')
    }
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = (e) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(false) }
    else { setPwError(true); setPw('') }
  }

  // ── Format date for display ───────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Today's date in YYYY-MM-DD for the leave-date input's min attribute
  const todayStr = new Date().toISOString().slice(0, 10)

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="font-bebas text-3xl tracking-[4px] text-gold mb-1">JEEVA</div>
            <div className="font-bebas text-sm tracking-[6px] text-cream/30 mb-6">ADMIN PANEL</div>
            <div className="w-12 h-12 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center mx-auto">
              <LogIn size={20} className="text-gold" />
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] tracking-[2px] uppercase text-cream/40 mb-2">Admin Password</label>
              <input
                type="password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="Enter password"
                className={`w-full bg-black-card border px-4 py-3 text-sm text-cream focus:outline-none focus:border-gold transition-colors placeholder:text-cream/20 ${
                  pwError ? 'border-red-500' : 'border-black-border'
                }`}
              />
              {pwError && <p className="text-red-400 text-xs mt-2">Incorrect password. Try again.</p>}
            </div>
            <button type="submit" className="w-full bg-gold text-black py-3 text-xs tracking-[3px] uppercase font-semibold hover:bg-gold-light transition-colors">
              Login
            </button>
          </form>
          <p className="text-center text-[11px] text-cream/20 mt-6">Set via VITE_ADMIN_PASSWORD in Vercel environment variables</p>
        </div>
      </div>
    )
  }

  // ── Stats from backend dashboard API ─────────────────────────────────────
  const totalRevenue    = stats?.revenue?.total ?? 0
  const completedCount  = stats?.bookings?.completed ?? 0
  const todayRevenue    = stats?.revenue?.today ?? 0
  const todayCount      = stats?.today_bookings ?? 0

  const statuses = ['all', 'pending', 'completed', 'cancelled']

  return (
    <div className="min-h-screen pt-24 pb-20 bg-black">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="text-[11px] tracking-[5px] uppercase text-gold mb-1">Admin Panel</div>
            <h1 className="font-playfair text-4xl font-bold">Dashboard</h1>
          </div>
          <button
            onClick={() => setAuthed(false)}
            className="flex items-center gap-2 border border-black-border text-cream/50 px-4 py-2 text-xs tracking-[2px] uppercase hover:border-gold/40 hover:text-gold transition-colors"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[2px] mb-8">
          {[
            { icon: <Calendar size={16} className="text-gold" />,     label: 'Total Bookings',  value: stats?.bookings?.total ?? '...' },
            { icon: <CheckCircle size={16} className="text-gold" />,  label: 'Completed',        value: completedCount },
            { icon: <Users size={16} className="text-gold" />,        label: "Today's Bookings", value: todayCount },
            { icon: <IndianRupee size={16} className="text-gold" />,  label: 'Total Revenue',    value: `₹${totalRevenue.toLocaleString('en-IN')}` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-black-card border border-black-border p-6">
              <div className="flex items-center gap-2 mb-3 text-cream/40">
                {icon}
                <span className="text-[10px] tracking-[2px] uppercase">{label}</span>
              </div>
              <div className="font-bebas text-4xl text-gold">{value}</div>
            </div>
          ))}
        </div>

        {/* Today's revenue extra card */}
        <div className="bg-black-card border border-gold/20 p-4 mb-8 flex items-center justify-between">
          <span className="text-[11px] tracking-[3px] uppercase text-cream/40">Today's Revenue</span>
          <span className="font-bebas text-3xl text-gold">₹{todayRevenue.toLocaleString('en-IN')}</span>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            LEAVE DAYS / BLOCKED DATES SECTION
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-black-card border border-black-border p-6 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <CalendarX size={16} className="text-gold" />
            <h2 className="font-playfair text-xl font-bold">Manage Leave Days</h2>
          </div>
          <p className="text-cream/40 text-xs mb-5">
            Block a whole day, or just a time range (e.g. lunch break). Blocked slots show faded/disabled on the booking page.
          </p>

          {/* Full day vs specific time toggle */}
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setBlockType('full')}
              className={`px-4 py-1.5 text-xs tracking-[1px] uppercase border transition-colors ${
                blockType === 'full' ? 'bg-gold text-black border-gold' : 'border-black-border text-cream/50 hover:border-gold/40'
              }`}
            >
              Full Day
            </button>
            <button
              type="button"
              onClick={() => setBlockType('time')}
              className={`px-4 py-1.5 text-xs tracking-[1px] uppercase border transition-colors ${
                blockType === 'time' ? 'bg-gold text-black border-gold' : 'border-black-border text-cream/50 hover:border-gold/40'
              }`}
            >
              Specific Time
            </button>
          </div>

          {/* Add leave day / time-block form */}
          <form onSubmit={addLeaveDate} className="flex flex-wrap gap-3 mb-6">
            <input
              type="date"
              value={newLeaveDate}
              min={todayStr}
              onChange={e => setNewLeaveDate(e.target.value)}
              required
              className="bg-black border border-black-border text-cream px-3 py-2 text-sm focus:outline-none focus:border-gold"
            />

            {blockType === 'time' && (
              <>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={e => setNewStartTime(e.target.value)}
                  required
                  className="bg-black border border-black-border text-cream px-3 py-2 text-sm focus:outline-none focus:border-gold"
                />
                <span className="text-cream/30 self-center text-xs">to</span>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={e => setNewEndTime(e.target.value)}
                  required
                  className="bg-black border border-black-border text-cream px-3 py-2 text-sm focus:outline-none focus:border-gold"
                />
              </>
            )}

            <input
              type="text"
              value={newLeaveReason}
              onChange={e => setNewLeaveReason(e.target.value)}
              placeholder={blockType === 'full' ? 'Reason (optional) — e.g. Festival holiday' : 'Reason (optional) — e.g. Lunch break'}
              className="flex-1 min-w-[180px] bg-black border border-black-border text-cream px-3 py-2 text-sm focus:outline-none focus:border-gold placeholder:text-cream/20"
            />
            <button
              type="submit"
              disabled={leaveSaving}
              className="bg-gold text-black px-5 py-2 text-xs tracking-[2px] uppercase font-semibold hover:bg-gold-light transition-colors inline-flex items-center gap-1 disabled:opacity-50"
            >
              <Plus size={14} /> {leaveSaving ? 'Adding...' : 'Block'}
            </button>
          </form>

          {/* List of blocked dates / time-slots */}
          {blockedDates.length === 0 ? (
            <p className="text-cream/30 text-sm">No leave days set. All upcoming dates are bookable.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {blockedDates.map(d => (
                <div
                  key={d._id}
                  className="flex items-center justify-between gap-2 bg-black border border-black-border px-3 py-2"
                >
                  <div>
                    <div className="text-sm text-cream">
                      {formatDate(d.date)}
                      {d.start_time && d.end_time && (
                        <span className="text-gold ml-2 text-xs">{d.start_time} - {d.end_time}</span>
                      )}
                      {!d.start_time && (
                        <span className="text-cream/30 ml-2 text-[10px] uppercase tracking-[1px]">Full Day</span>
                      )}
                    </div>
                    {d.reason && <div className="text-cream/40 text-xs">{d.reason}</div>}
                  </div>
                  <button
                    onClick={() => removeLeaveDate(d._id)}
                    className="text-cream/30 hover:text-red-400 transition-colors shrink-0"
                    title="Remove this block"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => handleFilterChange(s)}
              className={`px-4 py-1.5 text-xs tracking-[1px] uppercase border transition-colors ${
                filter === s
                  ? 'bg-gold text-black border-gold'
                  : 'border-black-border text-cream/50 hover:border-gold/40'
              }`}
            >
              {s === 'all' ? `All (${stats?.bookings?.total ?? 0})` : `${s} (${stats?.bookings?.[s] ?? 0})`}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-black-card border border-black-border p-16 text-center">
            <div className="text-cream/30 text-sm tracking-[2px] uppercase">Loading...</div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-black-card border border-black-border p-16 text-center">
            <BarChart2 size={40} className="text-cream/10 mx-auto mb-4" />
            <p className="text-cream/30 text-sm">No bookings found.</p>
          </div>
        ) : (
          <div className="bg-black-card border border-black-border overflow-x-auto">
            <table className="w-full admin-table">
              <thead>
                <tr className="border-b border-black-border bg-black/40">
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Package</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id} className="hover:bg-black/20 transition-colors">

                    <td className="text-gold font-bebas text-base">
                      #{b._id.toString().slice(-6)}
                    </td>

                    <td>
                      <div className="font-medium text-sm">{b.customer_name}</div>
                      <div className="text-cream/40 text-xs">{b.customer_phone}</div>
                      {b.customer_email && (
                        <div className="text-cream/30 text-xs">{b.customer_email}</div>
                      )}
                    </td>

                    <td>
                      <span className="text-[10px] bg-black border border-black-border px-2 py-0.5 text-cream/60 whitespace-nowrap">
                        {b.package?.name ?? 'N/A'}
                      </span>
                      {b.package?.duration_minutes && (
                        <div className="text-cream/30 text-xs mt-1">{b.package.duration_minutes} mins</div>
                      )}
                    </td>

                    <td className="text-sm text-cream/70 whitespace-nowrap">
                      {formatDate(b.booking_date)}
                    </td>

                    <td className="text-gold font-bebas text-base whitespace-nowrap">
                      {b.start_time} – {b.end_time}
                    </td>

                    <td className="font-bebas text-xl text-gold whitespace-nowrap">
                      ₹{b.amount?.toLocaleString('en-IN')}
                    </td>

                    <td>
                      <span className={`inline-flex items-center gap-1 text-[10px] tracking-[1px] uppercase px-2 py-1 border ${STATUS_STYLES[b.status] ?? STATUS_STYLES.pending}`}>
                        {STATUS_ICON[b.status]} {b.status}
                      </span>
                    </td>

                    <td>
                      <select
                        value={b.status}
                        onChange={e => updateBookingStatus(b._id, e.target.value)}
                        className="bg-black border border-black-border text-cream/60 text-xs px-2 py-1.5 focus:outline-none focus:border-gold cursor-pointer"
                      >
                        {['pending', 'completed', 'cancelled'].map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {bookings.length > 0 && (
          <div className="mt-4 text-right text-xs text-cream/30">
            Showing {bookings.length} bookings
          </div>
        )}

        {/* Package-wise stats */}
        {stats?.package_stats?.length > 0 && (
          <div className="mt-10">
            <div className="text-[11px] tracking-[5px] uppercase text-gold mb-4">Package Revenue Breakdown</div>
            <div className="grid gap-[2px]">
              {stats.package_stats.map(pkg => (
                <div key={pkg._id} className="bg-black-card border border-black-border p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{pkg.name}</div>
                    <div className="text-cream/40 text-xs">₹{pkg.price} per session · {pkg.completed_bookings} completed</div>
                  </div>
                  <div className="font-bebas text-2xl text-gold">₹{pkg.total_revenue.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}