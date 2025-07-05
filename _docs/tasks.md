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

## 🔄 **CURRENT PRIORITY: MINI APP SDK INTEGRATION (PHASE 2)**

**Status**: Frame foundation complete, now implementing proper Mini App SDK per [official documentation](https://miniapps.farcaster.xyz/)

**Critical Discovery**: Our current implementation is a **Farcaster Frame**, not a **Mini App**. Mini Apps require:

- Official Farcaster Mini App SDK (not just frames.js)
- Context API for rich user data
- Quick Auth for seamless authentication
- Ethereum wallet integration
- Native mobile features (notifications, haptics)
- Proper publishing flow to App Directory

**Current Phase**: Moving from Frame (basic interaction) → Mini App (full native-like experience)

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

## Day 2.5 – Farcaster Mini App Conversion (REVISED per Official Docs)

**Reference**: [Farcaster Mini Apps Official Documentation](https://miniapps.farcaster.xyz/)

### 🏗️ **Phase 1: Mini App Foundation (Current)**

- [x] **Create `farcaster.json` Manifest** – Required manifest file for Mini App publishing ✅
- [x] **Add Mini App Images** – Create icon.png, splash.png, feed.png for Mini App ✅
- [x] **Basic User Context** – Add frames.js user context integration ✅
- [ ] **Register Hosted Manifest** – Submit manifest to Farcaster for validation and testing

### 🚀 **Phase 2: Mini App SDK Integration (NEW - CRITICAL)**

- [ ] **Install Farcaster Mini App SDK** – Replace frames.js with official Mini App SDK
- [ ] **Implement Context API** – Rich user data access via SDK context
- [ ] **Add Quick Auth** – Seamless user authentication without forms/passwords
- [ ] **Create Mini App Entry Point** – Convert Frame route to proper Mini App interface
- [ ] **Implement Share Extensions** – Viral growth mechanics and social sharing

### 💰 **Phase 3: Ethereum Wallet Integration (Core Feature)**

- [ ] **Install Ethereum Wallet SDK** – Enable native wallet interactions
- [ ] **Add Wallet Connection** – Seamless wallet access for authenticated users
- [ ] **Implement Transaction Actions** – On-chain event subscriptions and payments
- [ ] **Add Chain Detection** – Support multiple networks (Ethereum, Base, etc.)
- [ ] **Error Handling** – Wallet errors, network switching, transaction failures

### 📱 **Phase 4: Native Features (Enhanced UX)**

- [ ] **Mobile Notifications** – Push notifications for event reminders
- [ ] **Haptic Feedback** – Native mobile interactions
- [ ] **Back Navigation** – Proper navigation flows within Farcaster
- [ ] **Mini App Detection** – Detect when running in Farcaster vs browser
- [ ] **Event System** – Custom events for user interactions

### 🌐 **Phase 5: Publishing & Discovery**

- [ ] **App Discovery Setup** – Optimize for Farcaster Mini App stores
- [ ] **Social Feed Integration** – 1-click discovery from social feeds
- [ ] **User Retention Features** – Save to favorites, quick access
- [ ] **Domain Verification** – Official domain association for publishing
- [ ] **Submit to App Directory** – Official Farcaster Mini App directory submission

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

### 🌐 **Step 3.5: Hosted Manifest Registration (NEW - CURRENT PRIORITY)**

**Issue**: Farcaster requires manifest registration before validation tools work properly

**Process**: Register at https://farcaster.xyz/~/developers/hosted-manifests?manage=true

**Tasks**:

- [ ] **Pre-Registration Setup**
  - [ ] Ensure ngrok tunnel is stable and accessible
  - [ ] Verify manifest endpoint works: `/.well-known/farcaster.json`
  - [ ] Test all image assets are accessible via ngrok URLs
  - [ ] Confirm manifest JSON is valid and complete

- [ ] **Submit to Farcaster Hosted Manifests**
  - [ ] Navigate to https://farcaster.xyz/~/developers/hosted-manifests?manage=true
  - [ ] Register base domain: `https://1100-2803-9810-51f9-7010-7482-85d8-aa9b-ef73.ngrok-free.app`
  - [ ] Submit manifest URL for validation
  - [ ] Wait for Farcaster approval/validation
  - [ ] Obtain hosted manifest ID or validation status

- [ ] **Post-Registration Testing**
  - [ ] Test Mini App in Warpcast Manifest Validator
  - [ ] Verify Frame renders properly in Farcaster tools
  - [ ] Test user interactions and personalization
  - [ ] Confirm "My Stats" button functionality for authenticated users

- [ ] **Documentation**
  - [ ] Document hosted manifest ID/URL for future reference
  - [ ] Update deployment notes with registration requirements
  - [ ] Create troubleshooting guide for manifest issues

**Dependencies**: Requires completed Steps 1-3 (manifest, images, user context) ✅

### 🧪 **Mini App Testing Checklist (Per Official Docs):**

**Phase 1 Tests:**

- [ ] Test Mini App manifest (`/.well-known/farcaster.json`)
- [ ] Verify Mini App images display correctly (icon, splash, feed)
- [ ] Test hosted manifest registration and validation

**Phase 2 Tests (SDK Integration):**

- [ ] Test Mini App SDK initialization and context
- [ ] Verify Quick Auth flow (automatic user sign-in)
- [ ] Test Mini App detection (vs browser/Frame mode)
- [ ] Verify social data access (profile, FID, username)
- [ ] Test share extensions and viral mechanics

**Phase 3 Tests (Wallet Integration):**

- [ ] Test wallet connection and authentication
- [ ] Verify transaction prompts and approvals
- [ ] Test chain detection and network switching
- [ ] Verify on-chain event subscription transactions
- [ ] Test error handling (rejected transactions, network errors)

**Phase 4 Tests (Native Features):**

- [ ] Test mobile notifications (push alerts)
- [ ] Verify haptic feedback on mobile devices
- [ ] Test back navigation within Farcaster
- [ ] Verify Mini App-specific features vs web fallbacks
- [ ] Test custom event system and user interactions

**Phase 5 Tests (Publishing & Discovery):**

- [ ] Test app discovery in Farcaster Mini App stores
- [ ] Verify 1-click social feed discovery
- [ ] Test save to favorites functionality
- [ ] Verify domain association and verification
- [ ] Test final app directory submission process

---

## Post-Hackathon (Nice-to-Haves)

- [ ] Mobile push (Expo + WalletConnect Notifications)
- [ ] ENS reverse lookup for prettier UI
- [ ] Usage analytics (PostHog)
- [ ] Delegate auto-vote smart module
