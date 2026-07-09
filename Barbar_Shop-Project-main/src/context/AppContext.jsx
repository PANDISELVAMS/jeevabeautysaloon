import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true)
  const [cart, setCart] = useState([])
  const [bookings, setBookings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jbs_bookings') || '[]')
    } catch { return [] }
  })

  useEffect(() => {
    document.body.classList.toggle('light', !darkMode)
  }, [darkMode])

  useEffect(() => {
    localStorage.setItem('jbs_bookings', JSON.stringify(bookings))
  }, [bookings])

  const addToCart = (service) => {
    setCart(prev =>
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    )
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(s => s.id !== id))

  const clearCart = () => setCart([])

  const cartTotal = cart.reduce((sum, s) => sum + s.price, 0)

  const addBooking = (booking) => {
    const newBooking = {
      ...booking,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'Confirmed',
    }
    setBookings(prev => [newBooking, ...prev])
    return newBooking
  }

  const updateBookingStatus = (id, status) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  return (
    <AppContext.Provider value={{
      darkMode, setDarkMode,
      cart, addToCart, removeFromCart, clearCart, cartTotal,
      bookings, addBooking, updateBookingStatus,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
