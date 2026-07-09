import { Link } from 'react-router-dom'
import { useReveal } from '../hooks/useReveal'
import { testimonials } from '../data/testimonials'
import { services } from '../data/services'
import { barbers } from '../data/barbers'
import { Star, ArrowRight } from 'lucide-react'

function StatCard({ num, label }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="reveal bg-black-card border border-black-border p-8 relative overflow-hidden group hover:border-gold/30 transition-colors">
      <div className="font-bebas text-6xl text-gold leading-none mb-2">{num}</div>
      <div className="text-[11px] tracking-[2px] uppercase text-cream/40">{label}</div>
      <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gold group-hover:w-full transition-all duration-500" />
    </div>
  )
}

export default function Home() {
  const aboutRef = useReveal()
  const servicesRef = useReveal()
  const barbersRef = useReveal()
  const testimonialsRef = useReveal()
  const featuredServices = services.filter(s => s.popular || s.id <= 4).slice(0, 4)

  return (
    <div className="min-h-screen">

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(ellipse at 75% 50%, rgba(201,168,76,0.07) 0%, transparent 60%),
              radial-gradient(ellipse at 20% 80%, rgba(201,168,76,0.04) 0%, transparent 50%)`
          }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 79px, #fff 80px)`
          }} />
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block">
          <img src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&q=80"
            alt="Barber at work" className="w-full h-full object-cover opacity-30 grayscale scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 animate-fadeUp">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-[1px] bg-gold" />
            <span className="text-[11px] tracking-[5px] uppercase text-gold">Est. 2012 · Tiruppur</span>
          </div>
          <h1 className="font-playfair text-6xl md:text-8xl lg:text-[108px] font-black leading-[0.9] mb-8">
            Look<br /><em className="text-gold italic">Sharp.</em><br />Feel Great.
          </h1>
          <p className="text-cream/60 text-base md:text-lg max-w-md leading-relaxed font-light mb-10">
            Tiruppur's premier grooming destination. Where precision craftsmanship meets old-school luxury — every single visit.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <Link to="/booking" className="bg-gold text-black px-8 py-4 text-xs tracking-[3px] uppercase font-semibold hover:bg-gold-light transition-colors inline-flex items-center gap-2">
              Book Appointment <ArrowRight size={14} />
            </Link>
            <Link to="/services" className="text-cream/60 text-xs tracking-[2px] uppercase hover:text-gold transition-colors inline-flex items-center gap-2">
              View Services <ArrowRight size={12} />
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-6 flex items-center gap-3 text-[10px] tracking-[3px] uppercase text-cream/30">
          <div className="w-8 h-[1px] bg-cream/30 animate-pulse" />
          Scroll
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-gold py-3 overflow-hidden">
        <div className="marquee-track">
          {[...Array(2)].flatMap((_, i) =>
            ['Premium Cuts','Beard Sculpting','Hot Towel Shave','D-Tan Treatment','Hair Colour','Head Massage','Facial Cleanup','The Royal Package'].map(item => (
              <span key={`${i}-${item}`} className="font-bebas text-lg tracking-[3px] text-black inline-flex items-center gap-4 whitespace-nowrap">
                {item} <span className="text-[8px]">✦</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* STATS */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div ref={aboutRef} className="reveal">
            <div className="w-12 h-[2px] bg-gold mb-6" />
            <h2 className="font-playfair text-4xl md:text-5xl font-bold leading-tight mb-6">
              Craftsmanship <span className="text-gold">runs deep</span> in every cut
            </h2>
            <p className="text-cream/55 text-sm leading-relaxed font-light max-w-md">
              Jeeva Beauty Saloon has been the go-to grooming spot in Tiruppur for over a decade. We combine traditional techniques with modern style to give you a look that turns heads.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-[2px]">
            <StatCard num="12+" label="Years of Excellence" />
            <StatCard num="10K+" label="Happy Clients" />
            <StatCard num="2" label="Master Stylists" />
            <StatCard num="98%" label="Satisfaction Rate" />
          </div>
        </div>
      </section>

      {/* FEATURED SERVICES */}
      <section className="py-24 bg-black-soft">
        <div className="max-w-7xl mx-auto px-6">
          <div ref={servicesRef} className="reveal flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="text-[11px] tracking-[4px] uppercase text-gold mb-3">What We Offer</div>
              <h2 className="font-playfair text-4xl md:text-5xl font-bold">Our Services</h2>
            </div>
            <Link to="/services" className="text-xs tracking-[2px] uppercase text-gold hover:text-gold-light transition-colors inline-flex items-center gap-2">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[2px]">
            {featuredServices.map((service) => (
              <div key={service.id} className="bg-black-card border border-black-border hover:border-gold/30 p-7 transition-all duration-300 group h-full">
                <div className="text-3xl mb-4">{service.icon}</div>
                <div className="font-playfair text-lg font-bold mb-2">{service.name}</div>
                <div className="text-[11px] tracking-[1px] uppercase text-gold/60 mb-3">{service.duration}</div>
                <p className="text-xs text-cream/45 leading-relaxed font-light mb-5">{service.description}</p>
                <div className="font-bebas text-3xl text-gold">₹{service.price}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/booking" className="bg-gold text-black px-10 py-4 text-xs tracking-[3px] uppercase font-semibold hover:bg-gold-light transition-colors inline-flex items-center gap-2">
              Book Any Service <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* BARBERS */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div ref={barbersRef} className="reveal mb-12">
          <div className="text-[11px] tracking-[4px] uppercase text-gold mb-3">The Team</div>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold">Meet Your Stylists</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {barbers.map((barber) => (
            <div key={barber.id} className="group relative overflow-hidden bg-black-card border border-black-border hover:border-gold/30 transition-colors">
              <div className="flex items-center gap-6 p-8">
                <div className="relative shrink-0">
                  <img src={barber.image} alt={barber.name}
                    className="w-24 h-24 object-cover grayscale group-hover:grayscale-0 transition-all duration-500 rounded-full" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gold rounded-full border-2 border-black" />
                </div>
                <div>
                  <div className="font-playfair text-2xl font-bold mb-1">{barber.name}</div>
                  <div className="text-[11px] tracking-[1px] uppercase text-gold mb-2">{barber.role}</div>
                  <div className="text-xs text-cream/50 mb-1">{barber.experience} Experience</div>
                  <div className="text-xs text-cream/40 italic">{barber.speciality}</div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-gold group-hover:w-full transition-all duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-black-soft">
        <div className="max-w-7xl mx-auto px-6">
          <div ref={testimonialsRef} className="reveal mb-12">
            <div className="text-[11px] tracking-[4px] uppercase text-gold mb-3">Client Stories</div>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold">What They Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.slice(0, 3).map((t) => (
              <div key={t.id} className="bg-black-card border border-black-border p-8 relative group hover:border-gold/20 transition-colors">
                <div className="absolute top-5 right-6 font-playfair text-7xl text-gold/8 leading-none pointer-events-none select-none">"</div>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={12} className="fill-gold text-gold" />)}
                </div>
                <p className="font-playfair italic text-sm text-cream/65 leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gold text-black font-bebas text-base rounded-full flex items-center justify-center shrink-0">{t.initials}</div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-[10px] tracking-[1px] text-cream/35 mt-0.5">{t.since}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gold py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-black">Ready for a Fresh Look?</h2>
            <p className="text-black/60 mt-2 text-sm">Book your slot now — no waiting, just results.</p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Link to="/booking" className="bg-black text-cream px-8 py-4 text-xs tracking-[3px] uppercase font-semibold hover:bg-black/80 transition-colors">
              Book Now
            </Link>
            <a href="tel:+919876543210" className="border border-black/30 text-black px-8 py-4 text-xs tracking-[3px] uppercase font-semibold hover:bg-black/10 transition-colors">
              Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
