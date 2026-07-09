import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './context/AppContext'
import { AnimatePresence, motion } from 'framer-motion'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'

import Home from './pages/Home'
import Services from './pages/Services'
import Booking from './pages/Booking'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Admin from './pages/Admin'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

function AnimatedRoutes() {
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        {!isAdmin && <Footer />}
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <AnimatedRoutes />
        <WhatsAppButton />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#F5F0E8',
              border: '1px solid #2A2A2A',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '13px',
            },
            success: {
              iconTheme: { primary: '#C9A84C', secondary: '#000' },
            },
          }}
        />
      </BrowserRouter>
    </AppProvider>
  )
}
