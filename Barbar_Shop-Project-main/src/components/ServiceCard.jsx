import { useApp } from '../context/AppContext'
import { Check } from 'lucide-react'

export default function ServiceCard({ service }) {
  const { cart, addToCart } = useApp()
  const inCart = cart.find(s => s.id === service.id)

  return (
    <div
      className={`relative group bg-black-card border transition-all duration-300 cursor-pointer select-none
        ${inCart
          ? 'border-gold shadow-lg shadow-gold/10'
          : 'border-black-border hover:border-gold/40'
        }
      `}
      onClick={() => addToCart(service)}
    >
      {service.popular && (
        <div className="absolute top-0 right-0 bg-gold text-black text-[10px] tracking-[2px] uppercase font-semibold px-3 py-1">
          Popular
        </div>
      )}

      <div className="p-7">
        <div className="text-3xl mb-4">{service.icon}</div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-playfair text-lg font-bold leading-tight">{service.name}</h3>
          {inCart && (
            <div className="shrink-0 w-5 h-5 bg-gold rounded-full flex items-center justify-center">
              <Check size={11} className="text-black" />
            </div>
          )}
        </div>
        <div className="text-[11px] tracking-[1px] uppercase text-gold/70 mb-3">{service.category} · {service.duration}</div>
        <p className="text-xs text-cream/50 leading-relaxed font-light mb-5">{service.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-bebas text-3xl text-gold">₹{service.price}</span>
          <span className={`text-xs tracking-[1px] uppercase transition-colors ${
            inCart ? 'text-gold' : 'text-cream/30 group-hover:text-cream/60'
          }`}>
            {inCart ? 'Added ✓' : '+ Add'}
          </span>
        </div>
      </div>
    </div>
  )
}
