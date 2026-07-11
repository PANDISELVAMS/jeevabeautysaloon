// ═══════════════════════════════════════════════════════════════════════
// SEOHead.jsx - Reusable component to set page title/description per page
//
// SETUP (one time):
// 1. npm install react-helmet-async
// 2. In main.jsx, wrap <App /> with <HelmetProvider>:
//
//    import { HelmetProvider } from 'react-helmet-async'
//    <HelmetProvider>
//      <App />
//    </HelmetProvider>
//
// USAGE (in any page component, e.g. Services.js):
//
//    import SEOHead from '../components/SEOHead'
//    ...
//    return (
//      <>
//        <SEOHead
//          title="Our Services | Jeeva Beauty Salon"
//          description="Browse haircuts, beard trims, hair spa & more. Book online instantly."
//        />
//        <div>...rest of page...</div>
//      </>
//    )
// ═══════════════════════════════════════════════════════════════════════

import { Helmet } from 'react-helmet-async'

export default function SEOHead({
  title = 'Jeeva Beauty Salon | Book Appointment Online',
  description = 'Premium hair cutting, styling & beauty services. Book your appointment online instantly.',
  noindex = false, // set true on Admin page - don't let Google index it
}) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  )
}
