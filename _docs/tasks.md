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
- [x] **Frame Action: Snooze** – POST to API → update reminder schedule.

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

## 🎉 **CURRENT STATUS: MVP COMPLETE!**

### ✅ **All Core Services Running:**

- **Webhook Listener** (Port 3000) - Capturing blockchain events
- **API Service** (Port 3001) - REST endpoints + iCal feed
- **Farcaster Frame** (Port 3002) - Interactive event display
- **Scheduler Service** (Background) - Email notifications + Redis queue
- **Web Dashboard** (Port 3003) - Complete event management UI

### ✅ **End-to-End Flow Verified:**

1. Events created via API/Web Dashboard
2. Events appear in Frame and Web interface
3. Scheduler processes reminders from Redis queue
4. Email notifications sent (Console mode configured)
5. iCal feed updates automatically for calendar apps

### ✅ **Ready for Testing:**

- Email service configured with Gmail SMTP (Console mode active)
- All services interconnected and functional
- Complete data pipeline: Webhook → Database → Scheduler → Notifications
- Web dashboard with stats, event management, and iCal subscription

---

## Day 2.5 – Stretch Objectives

- [ ] **Public Share Links** – Signed JWT embeds read-only calendar.
- [ ] **Google/Outlook OAuth** – One-click add to personal calendar.
- [ ] **Cross-Chain Support** – Polygon & Base selectable in add-event.

---

## Day 3 – Testing & Demo

- [ ] **Configure Gmail SMTP** – Switch from console mode to real email sending.
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

---

## Post-Hackathon (Nice-to-Haves)

- [ ] Mobile push (Expo + WalletConnect Notifications)
- [ ] ENS reverse lookup for prettier UI
- [ ] Usage analytics (PostHog)
- [ ] Delegate auto-vote smart module
