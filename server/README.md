# Jeeva Beauty Salon — Node.js + Express + MongoDB Backend

## Folder Structure
  jeeva_node_backend/
  ├── server.js              ← Main entry, cron auto-delete here
  ├── models/
  │   ├── Package.js         ← Package schema
  │   └── Booking.js         ← Booking schema + overlap check logic
  ├── routes/
  │   ├── packages.js        ← Package CRUD
  │   ├── bookings.js        ← Booking CRUD + status update
  │   └── dashboard.js       ← Dashboard stats + busy times
  ├── src_api.js             ← COPY THIS TO React project as src/api.js
  ├── package.json
  └── .env.example

## API Endpoints

  GET    /api/packages               → All packages
  GET    /api/packages?active=true   → Active only (booking form)
  POST   /api/packages               → Create package
  PUT    /api/packages/:id           → Update package
  DELETE /api/packages/:id           → Delete package

  GET    /api/busy?date=YYYY-MM-DD   → Busy time ranges for a date
  GET    /api/bookings               → All bookings (filter: ?status, ?date)
  POST   /api/bookings               → Create booking (overlap auto-checked)
  PATCH  /api/bookings/:id/status    → Update status (pending/completed/cancelled)
  DELETE /api/bookings/:id           → Delete booking

  GET    /api/dashboard              → All stats (counts, revenue, chart data)

## Railway Deploy Steps

### Step 1: GitHub
  git init
  git add .
  git commit -m "jeeva salon backend"
  → GitHub la new repo create panni push pannu

### Step 2: Railway
  1. railway.app → Login with GitHub
  2. New Project → Deploy from GitHub repo → repo select pannu

### Step 3: MongoDB add
  Railway dashboard → "+ New" → Database → MongoDB
  → MONGO_URL env variable auto set aagum

### Step 4: Environment Variables
  Railway → unoda service → Variables tab → add:

  MONGO_URI        = (Railway MongoDB la "Connect" click panni MONGO_URL copy pannu)
  PORT             = 5000
  CORS_ORIGIN      = https://your-salon-app.vercel.app

### Step 5: React project connect
  1. src_api.js → React project la src/api.js la copy pannu
  2. React project root la .env file:
     REACT_APP_API_URL=https://your-railway-url.railway.app
  3. npm install axios (if not already)

## Auto-delete
  Every Sunday 12:30 AM IST → 7 days pana bookings auto delete
  (server.js la node-cron already set aagirukku)
