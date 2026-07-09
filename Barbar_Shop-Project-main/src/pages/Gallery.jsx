import { useState } from 'react'
import { galleryImages } from '../data/gallery'
import { useReveal } from '../hooks/useReveal'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null)
  const headRef = useReveal()

  const prev = () => setLightbox(i => (i === 0 ? galleryImages.length - 1 : i - 1))
  const next = () => setLightbox(i => (i === galleryImages.length - 1 ? 0 : i + 1))

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={headRef} className="reveal mb-12">
          <div className="text-[11px] tracking-[5px] uppercase text-gold mb-3">Our Work</div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold">The Gallery</h1>
            <p className="text-cream/50 text-sm max-w-xs font-light leading-relaxed">
              Every cut tells a story. Browse our work and find your style.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-[3px]">
          {galleryImages.map((img, i) => (
            <div
              key={img.id}
              className={`relative overflow-hidden cursor-pointer group ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
              style={{ height: i === 0 ? 'auto' : '220px' }}
              onClick={() => setLightbox(i)}
            >
              <img
                src={img.src}
                alt={img.label}
                className={`w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105 ${
                  i === 0 ? 'h-64 md:h-full' : 'h-full'
                }`}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent">
                <span className="text-xs tracking-[2px] uppercase text-cream/80">{img.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram CTA */}
        <div className="text-center mt-12">
          <a href="#" className="inline-flex items-center gap-3 border border-black-border px-8 py-4 text-xs tracking-[3px] uppercase text-cream/60 hover:border-gold/40 hover:text-gold transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Follow @jeevabeautysaloon
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="lightbox-overlay" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/60 hover:text-white" onClick={() => setLightbox(null)}>
            <X size={28} />
          </button>
          <button className="absolute left-4 text-white/60 hover:text-gold" onClick={(e) => { e.stopPropagation(); prev() }}>
            <ChevronLeft size={40} />
          </button>
          <div className="max-w-3xl max-h-[80vh] relative" onClick={e => e.stopPropagation()}>
            <img
              src={galleryImages[lightbox].src}
              alt={galleryImages[lightbox].label}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-3 px-5 text-xs tracking-[3px] uppercase text-cream/70">
              {galleryImages[lightbox].label} · {lightbox + 1}/{galleryImages.length}
            </div>
          </div>
          <button className="absolute right-4 text-white/60 hover:text-gold" onClick={(e) => { e.stopPropagation(); next() }}>
            <ChevronRight size={40} />
          </button>
        </div>
      )}
    </div>
  )
}
