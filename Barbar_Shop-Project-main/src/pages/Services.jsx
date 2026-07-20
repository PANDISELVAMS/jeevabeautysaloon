import { useState } from 'react'
import { Link } from 'react-router-dom'
import { services, serviceCategories } from '../data/services'
import ServiceCard from '../components/ServiceCard'
import { useApp } from '../context/AppContext'
import { useReveal } from '../hooks/useReveal'
import { ShoppingBag, ArrowRight, X } from 'lucide-react'

export default function Services() {
  const [activeCategory, setActiveCategory] = useState('All')
  const { cart, cartTotal, removeFromCart } = useApp()
  const headRef = useReveal()

  const filtered = activeCategory === 'All'
    ? services
    : services.filter(s => s.category === activeCategory)

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={headRef} className="reveal mb-12">
          <div className="text-[11px] tracking-[5px] uppercase text-gold mb-3">What We Offer</div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold">Our Services</h1>
            <p className="text-cream/50 text-sm max-w-xs leading-relaxed font-light">
              Click any service to add it to your booking cart, then proceed to book.
            </p>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {serviceCategories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 text-xs tracking-[2px] uppercase transition-colors border ${
                activeCategory === cat
                  ? 'bg-gold text-black border-gold'
                  : 'border-black-border text-cream/50 hover:border-gold/40 hover:text-cream'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[2px] mb-16">
          {filtered.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          CART STICKY BAR - fixed height, chips scroll horizontally instead
          of wrapping and growing the box taller. This is what fixes the
          "box gets huge on mobile" bug.
      ═══════════════════════════════════════════════════════════════════ */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
          <div className="bg-black-soft border border-gold/40 shadow-2xl shadow-black px-4 py-3">

            {/* Top row: count + total + book button - ALWAYS visible, never pushed down */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 text-gold shrink-0">
                <ShoppingBag size={16} />
                <span className="font-bebas text-xl leading-none">
                  {cart.length} service{cart.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bebas text-2xl text-gold leading-none">₹{cartTotal}</span>
                <Link
                  to="/booking"
                  className="bg-gold text-black px-5 py-2 text-xs tracking-[2px] uppercase font-semibold hover:bg-gold-light transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                >
                  Book <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* Bottom row: chips - horizontal scroll, fixed single-line height,
                never wraps into multiple rows that would grow the box */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              {cart.map(s => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1 bg-black-card border border-black-border text-xs px-2 py-1 text-cream/70 whitespace-nowrap shrink-0"
                >
                  {s.name}
                  <button
                    onClick={() => removeFromCart(s.id)}
                    className="text-cream/30 hover:text-gold ml-1 shrink-0"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  )
}