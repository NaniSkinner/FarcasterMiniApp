# Product Requirements Document – ChainCal

## 1. Purpose

Deliver a cross-platform calendar that captures on-chain events and reminds users before critical deadlines, starting with EVM chains and Farcaster Frames.

## 2. Goals & Non-Goals

| Category      | In Scope                                                         | Out of Scope                  |
| ------------- | ---------------------------------------------------------------- | ----------------------------- |
| Chains        | Ethereum Mainnet, major L2s (Arbitrum, Optimism, Base)           | Non-EVM chains (stretch)      |
| Events        | ERC-20 `Transfer`, Governor `ProposalCreated`, custom ABI events | Arbitrary log parsing w/o ABI |
| Notifications | Farcaster Frame cards, email, webhooks                           | Mobile push (post-hackathon)  |
| Users         | Individuals & DAO delegates                                      | Enterprise admin dashboards   |

## 3. Personas & User Stories

**Delegate “Dana”**  
_As a DAO delegate, I need automatic reminders 24 h before proposals close so I never miss a vote._

**Investor “Ivan”**  
_As a token holder, I want vesting-cliff alerts so I can manage price risk._

**Founder “Fiona”**  
_As a project founder, I want to publish my unlock schedule so anyone can subscribe in one click._

## 4. Functional Requirements

| ID   | Requirement          | Acceptance Criteria                                                      |
| ---- | -------------------- | ------------------------------------------------------------------------ |
| FR-1 | Add Event            | User submits contract + event → parsed & saved, next timestamp displayed |
| FR-2 | List Calendar        | UI & Frame show upcoming events sorted ascending                         |
| FR-3 | Reminder Settings    | User selects lead time (e.g., 1 d, 4 h, 30 m)                            |
| FR-4 | Deliver Reminders    | Frame/email sent ≤15 s after scheduled time                              |
| FR-5 | Snooze               | Tap “snooze” defers reminder by chosen interval                          |
| FR-6 | iCal Export          | Generated feed refreshes ≤5 min                                          |
| FR-7 | Share Feed (stretch) | Public read-only link shows selected events                              |

## 5. Non-Functional Requirements

- **Performance** – ≤15 s event-to-reminder latency
- **Security** – No private keys stored; SIWE-based auth
- **Reliability** – 99 % reminder-delivery success during demo
- **Scalability** – Handle 10 k active subscriptions without refactor
- **Compliance** – GDPR-compliant email opt-out

## 6. Architecture

1. **Listener** – Alchemy Webhook → AWS Lambda → PostgreSQL (`events` table)
2. **Scheduler** – Redis-backed queue runs each minute, triggers Notify/email
3. **API** – REST/GraphQL for UI & Farcaster Frame endpoints
4. **Front-End** – SvelteKit (web) + Next.js Frame handler

## 7. KPIs

| KPI                         | Target |
| --------------------------- | ------ |
| Setup time (first reminder) | <2 min |
| Reminder accuracy           | ±60 s  |
| Daily active delegates      | ≥30    |
| Email open rate             | ≥50 %  |

## 8. Dependencies

- Alchemy Webhooks & Notify quotas
- Farcaster Frame API access
- Postgres + Redis hosting credits

## 9. Risks & Mitigations

| Risk                             | Mitigation                          |
| -------------------------------- | ----------------------------------- |
| Webhook rate limits              | Batch events, back-off logic        |
| Malicious/invalid ABIs submitted | ABI validation & manual review gate |
| Emails flagged as spam           | Use reputable ESP with DKIM/SPF     |

## 10. Timeline (3-Day Hack Sprint)

| Phase  | Deliverable             | Owner     | Day |
| ------ | ----------------------- | --------- | --- |
| Setup  | Repo, CI/CD, DB schema  | Team      | 0.5 |
| Core   | Webhook → DB pipeline   | Back-end  | 1   |
| UX     | Frame list + snooze MVP | Front-end | 1.5 |
| Notify | Email + scheduler logic | Back-end  | 2   |
| Polish | iCal feed, share link   | Full      | 2.5 |
| Demo   | Recorded walkthrough    | Full      | 3   |

## 11. Open Questions

1. Minimum preset contracts to include at launch?
2. Snooze: reschedule relative to original time or “now”?
3. Budget for post-hackathon hosting & email traffic?
