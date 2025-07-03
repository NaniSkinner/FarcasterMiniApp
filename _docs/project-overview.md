# ChainCal – On‑Chain Calendar & Reminder

## Elevator Pitch

**ChainCal** turns raw blockchain logs into a human‑friendly calendar so builders, investors, and DAO delegates never miss a vesting cliff, governance vote, or mint window. Subscribe to any smart‑contract event, choose how early you want to be pinged, and get reminders right inside Farcaster (Frames), email, or custom webhooks.

---

## The Problem

_On‑chain time is unforgiving._ Critical events are announced across block explorers, Discord channels, or scattered Twitter threads. Missing a deadline costs real money and governance power.

---

## The Solution

1. **Universal Event Subscription** – Paste a contract + event signature or pick from presets (ERC‑20, Governor, NFT drop). ChainCal creates an Alchemy Webhook that listens and records the next timestamp.
2. **Multi‑Channel Reminders** – Farcaster Frames, emails, or webhooks fire at a lead time you set (e.g., 24 h, 4 h, 30 m).
3. **Calendar Visualization** – Web dashboard and auto‑updating iCal feed slot straight into Google/Outlook.
4. **Smart Snooze & Auto‑Actions** – One‑tap “snooze 6 h” or future stretch: auto‑vote delegate script.
5. **Shared Feeds** – Curate a public list (e.g., “L2 Governance Events”) and share the link or Frame.

---

## Core Features

| Feature                            | MVP? | Notes                           |
| ---------------------------------- | ---- | ------------------------------- |
| Add Contract Event                 | ✅   | Manual entry + preset catalogue |
| Upcoming Events List (Web & Frame) | ✅   | Sorted by time                  |
| Reminder Delivery                  | ✅   | Email + Frame actions           |
| Snooze / Lead‑Time Edit            | ✅   | Defer or change lead time       |
| iCal Feed Export                   | ✅   | Refresh every 5 min             |
| Shared Read‑Only Feed              | ☑️   | Stretch if time allows          |
| Cross‑Chain Support                | ☑️   | Add Base/Polygon after demo     |

---

## Tech Stack

- **Frontend**: SvelteKit + Tailwind
- **Frames**: Next.js server with `@farcaster/core`
- **Backend**: Node (TypeScript) + Postgres + Redis queue
- **Webhooks & Notify**: Alchemy
- **Auth**: SIWE via Alchemy AA or Privy

```
┌────────────┐      Alchemy Webhook      ┌──────────────┐
│  Contract  │ ───────────────────────▶ │ Listener Fn  │
└────────────┘                          └─────┬────────┘
                                              │write
                                        ┌─────▼────────┐
              Frontend  REST  ───────▶  │ Postgres DB  │  ◀── Cron Scheduler ──┐
                                        └─────┬────────┘                      │
                                              │                                │send
                                          ┌───▼───┐                            │
                                          │  API  │ <──────── Frame Action ────┘
                                          └───────┘
```

---

## Key Integrations

| Service                      | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| **Alchemy Webhooks**         | Listen for on‑chain events in real time          |
| **Alchemy Notify**           | Fire emails/SMS without extra infra              |
| **Farcaster Frames**         | In‑context list & snooze actions                 |
| **IPFS via Alchemy Storage** | Optional: store ABI metadata or shared feed JSON |

---

## Success Metrics (Hackathon)

| Metric                       | Target                      |
| ---------------------------- | --------------------------- |
| Time to first reminder setup | < 2 minutes                 |
| Reminder latency             | ≤ 15 s after event emission |
| Demo‑day active testers      | ≥ 20 unique wallets         |

---

## Differentiators

- **Contract‑agnostic** – Works for any ABI, not just curated lists.
- **Frame‑native UX** – Users can act on reminders without leaving Warpcast.
- **Open iCal Feed** – Play nicely with Web2 calendars.

---

## Milestones (3‑Day Sprint)

| Day | Goal                                        |
| --- | ------------------------------------------- |
| 0.5 | Repo scaffold, DB schema, Alchemy key setup |
| 1   | Webhook listener & DB write flow ✔︎         |
| 1.5 | Frame list & snooze MVP ✔︎                  |
| 2   | Email reminder + scheduler ✔︎               |
| 2.5 | Web calendar UI + iCal export ✔︎            |
| 3   | Polish, demo video, deployment              |

---

_ChainCal is your crypto‑native “Google Calendar,” guaranteed never to miss a block._
