import { useReveal } from '../hooks/useReveal'
import { testimonials } from '../data/testimonials'
import { MapPin, Phone, Clock, Mail, Star } from 'lucide-react'

const HOURS = [
  { day: 'Monday', time: '9:00 AM – 8:00 PM', open: true },
  { day: 'Tuesday', time: '9:00 AM – 8:00 PM', open: true },
  { day: 'Wednesday', time: '9:00 AM – 8:00 PM', open: true },
  { day: 'Thursday', time: '9:00 AM – 8:00 PM', open: true },
  { day: 'Friday', time: '9:00 AM – 9:00 PM', open: true },
  { day: 'Saturday', time: '8:00 AM – 9:00 PM', open: true },
  { day: 'Sunday', time: 'Closed', open: false },
]

const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

export default function Contact() {
  const headRef = useReveal()
  const testRef = useReveal()

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div ref={headRef} className="reveal mb-12">
          <div className="text-[11px] tracking-[5px] uppercase text-gold mb-3">Find Us</div>
          <h1 className="font-playfair text-5xl md:text-6xl font-bold">Contact & Hours</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-16">
          <div className="space-y-4">
            {[
              { icon: <MapPin size={16} className="text-gold" />, label: 'Location', content: <div className="text-sm leading-relaxed text-cream/80">Anupparpalayam Bus stop back side<br />Tiruppur – 641 652<br />Tamil Nadu, India</div> },
              { icon: <Phone size={16} className="text-gold" />, label: 'Phone', content: <div><a href="tel:+917904616471" className="text-sm text-cream/80 hover:text-gold block">+91 79046 16471</a></div> },
              { icon: <Mail size={16} className="text-gold" />, label: 'Email', content: <a href="mailto:info@jeevabeautysaloon.in" className="text-sm text-cream/80 hover:text-gold">info@jeevabeautysaloon.in</a> },
            ].map(({ icon, label, content }) => (
              <div key={label} className="bg-black-card border border-black-border p-6 flex items-start gap-4 hover:border-gold/30 transition-colors">
                <div className="w-10 h-10 bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">{icon}</div>
                <div>
                  <div className="text-[11px] tracking-[2px] uppercase text-gold/70 mb-2">{label}</div>
                  {content}
                </div>
              </div>
            ))}
            <a href="https://wa.me/917904616471" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 bg-[#25D366]/10 border border-[#25D366]/20 p-5 hover:border-[#25D366]/40 transition-colors">
              <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div>
                <div className="text-sm font-medium text-[#25D366]">Chat on WhatsApp</div>
                <div className="text-xs text-cream/40 mt-0.5">Quick booking & queries</div>
              </div>
            </a>
          </div>

          <div className="bg-black-card border border-black-border p-7">
            <div className="flex items-center gap-3 mb-6">
              <Clock size={16} className="text-gold" />
              <div className="text-[11px] tracking-[3px] uppercase text-gold">Working Hours</div>
            </div>
            <div className="space-y-1">
              {HOURS.map(({ day, time, open }) => (
                <div key={day} className={`flex justify-between items-center py-3 border-b border-black-border last:border-0 ${day === today ? 'bg-gold/5 -mx-3 px-3' : ''}`}>
                  <div className="flex items-center gap-2">
                    {day === today && <div className="w-1.5 h-1.5 bg-gold rounded-full" />}
                    <span className={`text-sm ${day === today ? 'text-cream font-medium' : 'text-cream/60'}`}>{day}</span>
                    {day === today && <span className="text-[9px] tracking-[2px] uppercase text-gold bg-gold/10 px-2 py-0.5">Today</span>}
                  </div>
                  <span className={open ? 'font-bebas text-xl text-gold' : 'text-xs tracking-[2px] uppercase text-cream/25'}>{time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* All testimonials */}
        <div ref={testRef} className="reveal">
          <div className="text-[11px] tracking-[4px] uppercase text-gold mb-3">Client Stories</div>
          <h2 className="font-playfair text-4xl font-bold mb-10">All Reviews</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map(t => (
              <div key={t.id} className="bg-black-card border border-black-border p-7 relative hover:border-gold/20 transition-colors">
                <div className="absolute top-5 right-6 font-playfair text-7xl text-gold/8 leading-none pointer-events-none">"</div>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={11} className="fill-gold text-gold" />)}
                </div>
                <p className="font-playfair italic text-sm text-cream/65 leading-relaxed mb-5">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gold text-black font-bebas text-base rounded-full flex items-center justify-center shrink-0">{t.initials}</div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-[10px] tracking-[1px] text-cream/30 mt-0.5">{t.since}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
