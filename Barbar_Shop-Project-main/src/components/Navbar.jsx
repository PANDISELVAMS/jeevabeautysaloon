import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Sun, Moon, ShoppingBag, Menu, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { darkMode, setDarkMode, cart } = useApp()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-black/95 backdrop-blur-md shadow-lg shadow-black/50' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img src="/Logo.jpeg" alt="Jeeva Beauty Saloon" className="h-12 w-auto" />
        </Link>
        {/* Logo */}
        <Link to="/" className="flex flex-col leading-none">
          <span className="font-bebas text-2xl tracking-[4px] text-gold">JEEVA</span>
          <span className="font-bebas text-sm tracking-[6px] text-cream/60">BEAUTY SALOON</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `text-xs tracking-[2px] uppercase transition-colors gold-hover ${
                    isActive ? 'text-gold' : 'text-cream/70 hover:text-cream'
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full border border-white/10 hover:border-gold/50 transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode
              ? <Sun size={15} className="text-gold" />
              : <Moon size={15} className="text-black/70" />
            }
          </button>

          {/* Cart */}
          <Link to="/booking" className="relative p-2 rounded-full border border-white/10 hover:border-gold/50 transition-colors">
            <ShoppingBag size={15} className="text-gold" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Book Now */}
          <Link
            to="/booking"
            className="hidden md:block bg-gold text-black px-5 py-2 text-xs tracking-[2px] uppercase font-semibold hover:bg-gold-light transition-colors"
          >
            Book Now
          </Link>

          {/* Hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={20} className="text-gold" /> : <Menu size={20} className="text-cream" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-black/98 border-t border-white/10 px-6 pb-6 pt-2">
          <ul className="flex flex-col gap-4 mt-4">
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `block text-sm tracking-[2px] uppercase py-2 border-b border-white/5 ${
                      isActive ? 'text-gold' : 'text-cream/70'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
            <li>
              <Link
                to="/booking"
                className="block bg-gold text-black text-center py-3 text-xs tracking-[3px] uppercase font-semibold mt-2"
              >
                Book Appointment
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
