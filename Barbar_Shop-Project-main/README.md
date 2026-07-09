# 💈 Jeeva Beauty Saloon — Full Stack Frontend Web App

> A production-ready barbershop booking platform built with **React + Vite**, deployed live on **Vercel**.

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.3.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4.7-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-gold?style=for-the-badge)

**🌐 Live Demo:** [jeevabeautysaloon.vercel.app](https://jeevabeautysaloon.vercel.app)  
**📍 Built for:** Jeeva Beauty Saloon, Tiruppur, Tamil Nadu, India 🇮🇳

---

## 📸 Screenshots


---<img width="1915" height="907" alt="Screenshot 2026-03-24 202117" src="https://github.com/user-attachments/assets/699a1bb1-8815-47f9-8dca-8286882c4680" />
<img width="1918" height="908" alt="Screenshot 2026-03-24 202259" src="https://github.com/user-attachments/assets/e9e975bc-183a-495f-9ce6-39c7a627daad" />


## 📖 About The Project

This is a **complete business web application** built for a real barbershop. It goes far beyond a static landing page — featuring a multi-step booking wizard, admin dashboard, service cart with live total calculator, gallery lightbox, WhatsApp integration, and dark/light mode toggle — all built with modern React best practices.

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| ⚛️ React | 18.3.1 | UI Framework |
| ⚡ Vite | 5.3.4 | Build Tool & Dev Server |
| 🎨 Tailwind CSS | 3.4.7 | Utility-first Styling |
| 🎭 Framer Motion | 11.3.0 | Page Transitions & Animations |
| 🔀 React Router | v6.26.0 | Client-side Routing |
| 🔔 React Hot Toast | 2.4.1 | Notification System |
| 📅 React DatePicker | 7.3.0 | Booking Calendar |
| 🖼️ Lucide React | 0.383.0 | Icon Library |
| 📆 date-fns | 3.6.0 | Date Formatting |
| ☁️ Vercel | — | Hosting & Deployment |

---

## ✨ Features

### 👤 Customer Side
- 🏠 **Hero Landing Page** — Animated marquee ticker, scroll-reveal effects, parallax image
- 💇 **Services Page** — Category filter (All / Hair / Beard / Skin / Packages) with click-to-add cart
- 🛒 **Service Cart** — Live total calculator, add/remove services, visible across all pages
- 📅 **5-Step Booking Wizard**
  - Step 1 → Select services
  - Step 2 → Choose your barber
  - Step 3 → Pick date & time slot
  - Step 4 → Enter your details
  - Step 5 → Review & confirm with WhatsApp notification
- 🖼️ **Gallery** — Photo grid with full-screen lightbox and keyboard navigation (← → Esc)
- 📞 **Contact Page** — Working hours table with today highlight, Google Maps embed, enquiry form
- 💬 **WhatsApp Button** — Floating on every page with pre-filled booking message
- 🌙 **Dark / Light Mode** — Global theme toggle with smooth transition

### 🔒 Admin Side
- Password-protected dashboard at `/admin`
- View all bookings in a full data table
- Update booking status — Confirmed / Completed / Cancelled
- Revenue stats, today's appointment count
- Expand any booking row for full customer details
- WhatsApp customers directly from the dashboard
- Password secured via **Vercel Environment Variables** (never hardcoded)

### ⚙️ Technical Highlights
- Global state with **React Context API** (cart, bookings, theme)
- Booking data persisted in **localStorage**
- Scroll-reveal animations using **Intersection Observer API**
- Smooth page transitions with **Framer Motion AnimatePresence**
- Fully **responsive** — mobile, tablet, desktop
- **vercel.json** rewrites for React Router to work on live server

---

## 📁 Project Structure
```
jeeva-beauty-saloon/
├── public/
│   ├── Logo.jpeg              ← Shop logo
│   └── scissors.svg           ← Favicon fallback
├── src/
│   ├── components/
│   │   ├── Navbar.jsx         ← Sticky nav, dark mode toggle, cart badge
│   │   ├── Footer.jsx         ← Links, contact info, social icons
│   │   ├── ServiceCard.jsx    ← Clickable card with add-to-cart
│   │   └── WhatsAppButton.jsx ← Fixed floating WhatsApp button
│   ├── context/
│   │   └── AppContext.jsx     ← Global: cart, bookings, dark mode
│   ├── data/
│   │   ├── services.js        ← 11 services with pricing
│   │   ├── barbers.js         ← 2 barber profiles
│   │   ├── testimonials.js    ← 6 client reviews
│   │   └── gallery.js         ← Gallery image list
│   ├── hooks/
│   │   └── useReveal.js       ← Scroll-reveal intersection observer hook
│   ├── pages/
│   │   ├── Home.jsx           ← Landing page
│   │   ├── Services.jsx       ← Services + filter + floating cart
│   │   ├── Booking.jsx        ← 5-step booking wizard
│   │   ├── Gallery.jsx        ← Photo grid + lightbox
│   │   ├── Contact.jsx        ← Hours, map, contact form
│   │   └── Admin.jsx          ← Protected admin dashboard
│   ├── App.jsx                ← Router + AnimatePresence
│   ├── main.jsx               ← React entry point
│   └── index.css              ← Tailwind + global styles
├── vercel.json                ← React Router rewrite rules
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/RAJASEKAR-01/Barbar-Shop-Project.git

# 2. Navigate into the project
cd jeeva-beauty-saloon

# 3. Install dependencies
npm install

# 4. Create environment file
cp .env.example .env.local
# Edit .env.local and set your admin password

# 5. Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔐 Environment Variables

Create a `.env.local` file in the root:
```env
VITE_ADMIN_PASSWORD=your_strong_password_here
```

For **Vercel deployment**, add this in:
> Vercel Dashboard → Your Project → Settings → Environment Variables

---

## 🔒 Admin Dashboard

| Detail | Value |
|---|---|
| URL | `/admin` |
| Password | Set via `VITE_ADMIN_PASSWORD` env variable |
| Features | View bookings, update status, revenue stats, WhatsApp customers |

---

## ☁️ Deployment on Vercel
```bash
# Build for production
npm run build
# Output goes to /dist folder
```

**Vercel Settings:**

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

> The `vercel.json` file is already configured to handle React Router — no blank page on refresh!

---

## 🎯 What I Learned

- Building multi-step form wizards with complex React state
- React Context API for global cart and booking management
- Persisting data with localStorage
- Deploying React + Vite apps on Vercel with proper routing
- Securing sensitive data using environment variables
- Intersection Observer API for scroll-reveal animations
- Framer Motion for professional page transitions
- Tailwind CSS custom design system (fonts, colors, spacing)

---

## 👨‍💻 Author

**Rajasekar**  
🐙 GitHub: [@RAJASEKAR-01](https://github.com/RAJASEKAR-01)  
💼 LinkedIn: [https://www.linkedin.com/in/rajasekar-developer]

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## ⭐ Support

If you found this project helpful or interesting, please consider giving it a **star ⭐ on GitHub** — it really helps!

---

*Made with ❤️ in Tamil Nadu, India 🇮🇳*
