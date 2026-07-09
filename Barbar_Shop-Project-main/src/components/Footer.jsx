import { Link } from 'react-router-dom'
import { MapPin, Phone, Clock, Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black-soft border-t border-white/5 pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <div className="font-bebas text-3xl tracking-[4px] text-gold">JEEVA</div>
              <div className="font-bebas text-base tracking-[6px] text-cream/40">BEAUTY SALOON</div>
            </div>
            <p className="text-sm text-cream/50 leading-relaxed max-w-xs font-light">
              Premium grooming for the modern man. Serving Tiruppur with craft and care since 2012.
            </p>
            <div className="flex gap-4 mt-5">
              <a href="#" className="p-2 border border-white/10 hover:border-gold hover:text-gold text-cream/40 transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" className="p-2 border border-white/10 hover:border-gold hover:text-gold text-cream/40 transition-colors">
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[11px] tracking-[3px] uppercase text-gold mb-5">Navigate</h4>
            <ul className="space-y-3">
              {[
                ['/', 'Home'],
                ['/services', 'Services'],
                ['/booking', 'Book Appointment'],
                ['/gallery', 'Gallery'],
                ['/contact', 'Contact'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-cream/50 hover:text-gold transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] tracking-[3px] uppercase text-gold mb-5">Find Us</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-cream/50">
                <MapPin size={14} className="text-gold mt-0.5 shrink-0" />
                <span>Anupparpalayam Bus stop back Side,<br />Tiruppur – 641 652,<br />Tamil Nadu</span>
              </li>
              <li className="flex gap-3 text-sm text-cream/50">
                <Phone size={14} className="text-gold mt-0.5 shrink-0" />
                <span>+91 7904616471</span>
              </li>
              <li className="flex gap-3 text-sm text-cream/50">
                <Clock size={14} className="text-gold mt-0.5 shrink-0" />
                <span>Mon–Sun: 8am – 8pm<br /></span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-cream/25">
          <span>© 2025 Jeeva Beauty Saloon. All rights reserved.</span>
          <span>Tiruppur, Tamil Nadu, India</span>
        </div>
      </div>
    </footer>
  )
}
