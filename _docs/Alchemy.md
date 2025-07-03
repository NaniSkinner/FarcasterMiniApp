# Alchemy Integration: Best Practices & Rules

This document outlines how we will use Alchemy's suite of tools to power the core functionality of ChainCal. Adhering to these practices will ensure a robust, scalable, and secure application.

This guidance is based on our project requirements and the official [Alchemy Data Overview documentation](https://www.alchemy.com/docs/reference/data-overview).

---

## 1. Core Services & Purpose

We will leverage the following Alchemy services:

- **Alchemy Webhooks (for Event Listening):** This is the foundation of our data pipeline. We will use it to receive real-time notifications about on-chain events that our users subscribe to.
- **Alchemy Webhooks (for Email Notifications):** This is our user-facing notification system. The product, formerly known as "Alchemy Notify," allows us to send alerts (like emails) triggered by our backend scheduler.
- **Sign-In with Ethereum (SIWE):** This will be our authentication method, providing a secure and crypto-native login experience for our users.

---

## 2. Best Practices for Alchemy Webhooks (Event Listening)

This is the most critical integration for our application's core functionality.

- **Dynamic Creation:** For each unique contract event a user subscribes to, our backend will programmatically create a new Alchemy Webhook. This ensures we are only listening to the events we absolutely need.
- **Endpoint Security:** The listener service (`services/listener`) must expose a public URL to receive webhook POST requests. **It is critical that this endpoint validates the `X-Alchemy-Signature` header of every incoming request.** This cryptographic signature ensures that the request is genuinely from Alchemy and prevents third parties from sending malicious data to our system.
- **Idempotency & Error Handling:** Our listener service should be designed to handle duplicate events gracefully (idempotency). If we receive a webhook but fail to process it (e.g., database connection issue), we need robust error handling and logging. Alchemy will retry sending the webhook, so our system must not create duplicate entries.
- **Efficient Payload Parsing:** The listener should be optimized to quickly parse the incoming webhook payload, extract only the necessary data (`event_args`, `transactionHash`, `blockNumber`, etc.), and write it to our PostgreSQL database. Any unnecessary processing should be avoided to keep the listener fast and scalable.

---

## 3. Best Practices for Alchemy Webhooks (Email Notifications)

Our scheduler will trigger emails via Alchemy's API.

- **Trigger from Backend:** The logic for _when_ to send a reminder will live exclusively in our backend scheduler. The scheduler will query our database and then make an API call to Alchemy to send the email.
- **Templated Emails:** We should utilize templating for our emails to provide clear, consistent, and actionable information. The template should include the event details and a clear call-to-action (e.g., a link to the dApp or a snooze action).
- **User-Centric Compliance:** We must respect the user's inbox. Every email must include a clear and easy-to-use "unsubscribe" link. This link should call back to our API to update the user's notification preferences in our database.

---

## 4. Best Practices for Sign-In with Ethereum (SIWE)

- **Client-Side Message Creation:** The frontend (`apps/web` and the Farcaster Frame server) will be responsible for constructing the EIP-4361 compliant message for the user to sign.
- **Server-Side Verification:** The signed message will be sent to our backend API, which will be solely responsible for verifying its authenticity. After successful verification, the API will issue a session token (e.g., a JWT) to the client.
- **No Private Keys:** At no point should our application ever ask for, handle, or store user private keys. The entire authentication flow is based on public-key cryptography and is non-custodial.
