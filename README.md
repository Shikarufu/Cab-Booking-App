# 🚗 Cab Booking App (Full-Stack Ride-Hailing Platform)

A full-stack ride-hailing web application built as an internship project. This application connects riders and drivers in real time, featuring secure authentication, live route tracking, dynamic fare estimation, and integrated payment processing.

---

## ✨ Key Features

* **User Authentication & Role Management:** Secure sign-up, login, social auth, and profile management powered by **Clerk**.
* **Ride Booking System:** Interactive pickup and drop-off selection with instant fare calculation.
* **Driver Dashboard:** Dedicated interface for drivers to view, accept, or decline incoming ride requests.
* **Real-Time Tracking & Maps:** Live GPS route rendering, driver tracking, and ETA updates via **Google Maps API** and real-time sockets/database listeners.
* **Secure Payments:** End-to-end payment processing for riders and earnings management for drivers using **Stripe**.
* **Ride History & Digital Receipts:** Complete trip logs with downloadable payment receipts.
* **Ratings & Reviews:** Two-way rating and feedback system to maintain service quality.
* **Responsive Design:** Mobile-first UI built with **Tailwind CSS** for seamless use across desktop and mobile devices.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router), React, TypeScript
* **Styling:** Tailwind CSS
* **Authentication:** Clerk
* **Backend & Database:** Next.js API Routes / Node.js, Supabase (PostgreSQL)
* **APIs & Integrations:** Google Maps API, Stripe Payment Gateway

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally on your machine.

### 1. Clone the Repository
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd cab-booking-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory of the project and add the required API keys (do **not** commit this file to Git):

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Database (Supabase) - To be added in Day 2
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API - To be added in Day 4
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Stripe Payments - To be added in Day 8
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
# STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📅 2-Week Development Roadmap

### Week 1: Setup & Core Features
- [x] **Day 1:** Project initialization (Next.js + Tailwind CSS) & Clerk authentication setup
- [ ] **Day 2:** Database setup (Supabase/PostgreSQL) & data models (Users, Rides, Payments)
- [ ] **Day 3:** User dashboard & profile management
- [ ] **Day 4:** Google Maps integration & ride request system
- [ ] **Day 5:** Driver dashboard & ride matching logic
- [ ] **Day 6:** Real-time ride status updates & notifications
- [ ] **Day 7:** Testing & bug fixes

### Week 2: Payments, Reviews & Deployment
- [ ] **Day 8:** Stripe payment gateway integration
- [ ] **Day 9:** Ride history & receipt generation
- [ ] **Day 10:** Driver ratings & review system
- [ ] **Day 11:** UI/UX polish & mobile responsiveness
- [ ] **Day 12:** API security & performance optimization
- [ ] **Day 13:** End-to-end workflow testing
- [ ] **Day 14:** Production deployment on Vercel