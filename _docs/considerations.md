# ChainCal Project: Pre-Build Considerations

This document outlines the key considerations for the successful development and delivery of the ChainCal Farcaster Mini App, based on the project documentation. It is intended to align the team on scope, technical approach, and potential challenges before development begins.

---

## 1. Project & Goal Summary

- **Vision:** To create a "Google Calendar for on-chain events," allowing users to subscribe to smart contract events and receive timely reminders.
- **Core Problem:** The time-sensitive and scattered nature of on-chain events leads to missed opportunities with financial or governance implications.
- **Primary Channel:** Farcaster Frames are a critical user interaction point for notifications and actions (like "snooze"), defining the project as a "Mini App."

---

## 2. Architectural & Technical Stack

- **Monorepo Strategy:** The choice of a PNPM monorepo (`apps/web`, `packages/core`, `services/listener`) is a good one for code sharing and managing distinct services. We must ensure that dependencies and scripts are configured correctly from Day 1 to avoid integration headaches.
- **Frontend/Backend Split:**
  - **Web:** SvelteKit
  - **Frames:** Next.js
  - **API:** Node.js (TypeScript)
  - This hybrid approach is necessary due to the differing strengths of SvelteKit and Next.js for web apps and Farcaster Frames, respectively. We need to be mindful of managing two similar-but-different frontend codebases.
- **Database Choice:**
  - **PostgreSQL (Events):** A solid choice for structured event data. The schema needs to be finalized early.
  - **Redis (Scheduler):** Using a Redis Sorted Set for scheduling is efficient. We need to ensure the worker logic is robust to handle job failures and retries.
- **Authentication:** Sign-In with Ethereum (SIWE) is the specified authentication method. This is a crypto-native approach that aligns well with the target audience.

---

## 3. Core Feature & MVP Scope

The 3-day hackathon timeline is aggressive. Success depends on ruthlessly prioritizing the MVP.

- **Must-Haves (MVP):**

  1.  **Event Subscription:** Manual entry of contract address and event signature. A small, curated list of presets (e.g., ERC20 Transfer) is vital for user onboarding.
  2.  **Data Pipeline:** The core flow: Alchemy Webhook → Lambda Listener → PostgreSQL. This must be the first priority.
  3.  **Farcaster Frame Notifications:** A Frame that displays upcoming events and allows a "snooze" action. This is the flagship feature.
  4.  **Email Notifications:** A secondary, but important, notification channel.
  5.  **Basic Web UI:** A simple list view of upcoming events. The full calendar grid can be secondary.
  6.  **iCal Export:** An endpoint that generates a standard `.ics` file.

- **Stretch Goals (To be considered post-MVP):**
  - Public sharing of calendar feeds.
  - Advanced snooze logic.
  - Direct integration with Google/Outlook via OAuth.
  - Support for non-EVM chains.

---

## 4. Key Integrations & Dependencies

The project is heavily reliant on third-party APIs. API keys, usage quotas, and potential failure points for each service must be understood.

- **Alchemy:**
  - **Webhooks:** The foundation of the event listening system. We must be prepared for potential rate limits and have back-off/retry logic in our listener.
  - **Notify:** Used for email delivery. We need to confirm quotas and ensure sender reputation (DKIM/SPF) to avoid spam folders.
  - **SIWE:** For authentication.
- **Farcaster:**
  - **`@farcaster/core`:** The library for building frames. We need to ensure we are using a stable version.
  - **Frame Actions:** The reliability of Frame action callbacks is critical for the user experience.
- **Hosting Providers:**
  - Vercel, Fly.io, Supabase are the suggested providers. We should set up accounts and have a clear deployment plan for each service (web, frames, API, DB).

---

## 5. Risks & Mitigation Strategies

- **Risk: Tight Timeline.**
  - **Mitigation:** Adhere strictly to the MVP scope. Use the task breakdown in `tasks.md` as a checklist. Parallelize work where possible (e.g., frontend and backend development after API contract is defined).
- **Risk: Malicious User Input.**
  - **Mitigation:** Implement validation on all user inputs, especially contract addresses and ABIs. A manual review gate for new public presets is a good idea.
- **Risk: Reminder Accuracy & Latency.**
  - **Mitigation:** The NFR of ≤15s latency is ambitious. The scheduler cron job frequency (e.g., every minute) will be the main factor. Load testing the webhook listener is a specific task that should not be skipped.
- **Risk: Email Deliverability.**
  - **Mitigation:** Use a reputable email service provider (ESP) as planned. Monitor bounce and spam complaint rates.

---

## 6. Development & Deployment Strategy

- **Setup First:** Day 0 tasks are critical. The repository, CI/CD pipeline, and provisioned databases should be ready before any feature code is written.
- **Deploy Early, Deploy Often:** Each piece of the architecture (listener, API, Frame server) should be deployed to its target environment as soon as it has basic functionality. This will uncover integration issues sooner.
- **Testing:** While the timeline is short, critical path unit tests (API endpoints, scheduler logic) and a full end-to-end test script are essential for a successful demo.

---

## 7. Open Questions & Post-Hackathon

- **Snooze Logic:** "Reschedule relative to original time or 'now'?" - This needs to be decided before implementing the snooze feature. For an MVP, "snooze from now" is simpler.
- **Initial Content:** "Minimum preset contracts to include at launch?" - We should select 3-5 high-value, well-known contracts (e.g., a major DAO's governance contract, a popular NFT contract).
- **Sustainability:** The question of post-hackathon hosting and email costs needs to be considered. The project's architecture is not free to run, and a plan for its future should be discussed.
