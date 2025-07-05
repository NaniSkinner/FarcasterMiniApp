# Build Tasks – ChainCal

> **Tip:** Tasks are ordered for a 3‑day hack sprint. Check items off as they are completed.

## Day 0 (Prep – 0.5 day)

- [x] **Create Repo & CI** – GitHub + branch protection, ESLint, Prettier.
- [x] **Scaffold Monorepo** – PNPM workspaces: `apps/web`, `packages/core`, `services/listener`.
- [x] **Database Provisioning** – Spin up Postgres + Redis (Supabase/Fly.io).

---

## Day 1 – Core Data Pipeline

- [x] **Define Event Schema**
  - [x] `contract_address`
  - [x] `event_signature`
  - [x] `event_args` (indexed JSON)
  - [x] `next_timestamp`
- [x] **Implement Alchemy Webhook Listener**
  - [x] Create webhook via API
  - [x] Express endpoint parses payload → writes to `events` table
  - [x] HMAC signature validation for security
- [ ] **Back-Fill Utility (Optional)** – CLI that scans past logs to populate initial `next_timestamp`s.
- [x] **Complete REST API**
  - [x] `GET /events/upcoming` and `POST /events`
  - [x] `GET /events` with pagination
  - [x] `PATCH /events/:id/snooze` for reminder management
  - [x] `GET /calendar.ics` for iCal feed

---

## Day 1.5 – Farcaster Frame MVP

- [x] **Set Up Frame Server** (Next.js + `@farcaster/core`).
- [x] **Frame: Events List** – Render top 5 upcoming events with action buttons.
- [x] **Frame Action: Snooze** – POST to API → update reminder schedule. ✅

---

## Day 2 – Notifications & UX Polish

- [x] **Email Service**
  - [x] Integrate Gmail SMTP + Console Mode for testing.
  - [x] HTML template with event metadata + call-to-action.
  - [x] Configurable email providers (Gmail, SendGrid, Alchemy Notify).
- [x] **Reminder Scheduler**
  - [x] Queue upcoming reminders (Redis Sorted Set).
  - [x] Cron worker sends email notifications every minute.
  - [x] In-memory fallback for Redis unavailability.
- [x] **Web Dashboard** (SvelteKit)
  - [x] Event management interface with stats cards.
  - [x] Add-event modal with preset contract templates.
  - [x] Real-time data integration with API service.
- [x] **iCal Feed**
  - [x] Dynamic `.ics` endpoint with proper calendar formatting.
  - [x] Subscription link in web dashboard.

---

## 🔄 **CURRENT PRIORITY: CONVERT FRAME TO MINI APP**

**Status**: Core MVP complete, now converting Farcaster Frame → Mini App for proper publishing

## 🎉 **MVP FOUNDATION COMPLETE!**

**✅ ALL CRITICAL FEATURES COMPLETED:**

**🌐 Web Dashboard:** Frontend loading fixed, full TypeScript support, beautiful UI
**🖼️ Farcaster Frame:** End-to-end snooze functionality working perfectly  
**🛠️ API Service:** All endpoints functional with proper validation
**📧 Email Service:** Scheduler + notifications with Redis queue
**📅 iCal Export:** Dynamic calendar feed generation

**✅ Frame Snooze Action COMPLETED:**

- POST handler implemented with proper error handling
- Database timestamp updates working
- Success/error feedback displayed in Frame
- Complete end-to-end user flow functional

**🔄 NEXT PHASE: Convert Frame to Mini App**

- Current: Working Farcaster Frame with snooze functionality
- Goal: Full Farcaster Mini App with user context, wallet actions, and publishing

**📚 Frame vs Mini App Differences:**

- **Frame**: Basic interaction via meta tags, limited functionality
- **Mini App**: Full web app with user context, wallet integration, discoverable in app directory

---

## 🔧 **REMAINING TASKS:**

### ✅ **All Core Services Implemented:**

- **Webhook Listener** (Port 3000) - Complete webhook handler with HMAC validation
- **API Service** (Port 3001) - All REST endpoints + iCal feed fully functional
- **Farcaster Frame** (Port 3002) - Event display working, snooze needs completion
- **Scheduler Service** (Background) - Email notifications + Redis queue with fallback
- **Web Dashboard** (Port 3003) - Complete event management UI with beautiful design

### ✅ **Core Features Working:**

1. Events created via Web Dashboard with preset templates
2. Events displayed in both Frame and Web interface
3. Scheduler processes reminders from Redis queue (with fallback)
4. API endpoints all functional with proper validation
5. iCal feed generation working for calendar apps

### 🔧 **Current Phase: Testing & Bug Fixes**

- All services implemented and running locally
- Web dashboard fully functional with stats and event management
- API service robust with comprehensive error handling
- Minor Frame snooze action needs completion
- Ready for testing and deployment phase

---

## Day 2.5 – Stretch Objectives

- [ ] **Public Share Links** – Signed JWT embeds read-only calendar.
- [ ] **Google/Outlook OAuth** – One-click add to personal calendar.
- [ ] **Cross-Chain Support** – Polygon & Base selectable in add-event.

---

## Day 2.5 – Critical Bug Fixes

- [x] **Frontend Loading Issue** – Fixed `onMount` reliability with setTimeout fallback ✅
- [x] **Events Page TypeScript Errors** – Fixed all 10 errors + 1 accessibility warning ✅
- [x] **Fix Frame Snooze Action** – Complete POST handler for snooze button functionality ✅
- [x] **Test Frame Snooze** – Verify snooze updates reminder time via API ✅
- [ ] **Environment Configuration** – Update hardcoded localhost URLs for deployment readiness

## Day 2.5 – Farcaster Mini App Conversion

- [ ] **Create `farcaster.json` Manifest** – Required manifest file for Mini App publishing
- [ ] **Add Mini App Images** – Create icon.png, splash.png, feed.png for Mini App
- [ ] **Configure Mini App Context** – Add user context integration (username, FID, etc.)
- [ ] **Add Wallet Actions** – Enable users to perform on-chain actions via Farcaster wallet
- [ ] **Create Mini App Landing Page** – Convert Frame to proper Mini App entry point
- [ ] **Add Account Association** – Generate domain manifest for publishing
- [ ] **Test Mini App Locally** – Use cloudflared/ngrok + Farcaster Embed tool
- [ ] **Publish Mini App** – Submit to Farcaster Mini App directory

## Day 3 – Testing & Demo

- [x] **Configure Gmail SMTP** – Switch from console mode to real email sending.
- [ ] **User Testing** – Invite testers to use the complete system.
- [ ] **Load Test Webhook** – Simulate multiple events → ensure <15s latency.
- [ ] **End-to-End Demo Script** – Record flow: add event → Frame reminder → snooze.
- [ ] **Deploy** – Vercel (web & Frame), Fly.io (API), Supabase (DB).
- [ ] **Submit** – Update README, slide deck, Loom video.

### 🔧 **Testing Checklist:**

- [ ] Test webhook with real Alchemy events
- [ ] Verify email notifications with real SMTP
- [ ] Test iCal feed subscription in Google Calendar/Apple Calendar
- [ ] Frame interactions in Farcaster client
- [ ] Web dashboard on mobile devices

### 🖼️ **Mini App Testing Checklist:**

- [ ] Test Mini App manifest (`/.well-known/farcaster.json`)
- [ ] Verify Mini App images display correctly (icon, splash, feed)
- [ ] Test user context integration (username, FID, profile)
- [ ] Test wallet actions (transaction prompts, chain switching)
- [ ] Test Mini App in Farcaster Embed tool
- [ ] Test Mini App on mobile Farcaster client
- [ ] Verify account association for publishing

---

## Post-Hackathon (Nice-to-Haves)

- [ ] Mobile push (Expo + WalletConnect Notifications)
- [ ] ENS reverse lookup for prettier UI
- [ ] Usage analytics (PostHog)
- [ ] Delegate auto-vote smart module
