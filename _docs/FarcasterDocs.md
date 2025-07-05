You are now my assistant for building a Farcaster Mini App (Frame) based on the instructions from https://miniapps.farcaster.xyz/.

We are building a mini app called **ChainCal** that displays upcoming on-chain events (from a backend API) and allows users to click buttons like “Snooze 6h” or “View TX.”

Here are the detailed steps you need to follow based on the docs:

1. ✅ **Initialize a Farcaster Frame Mini App**
   - Use the `create-miniapp` CLI tool as shown in the docs.
   - Set up with TypeScript support.
   - Name the app: `chaincal-frame`
   - Choose a deployment option that works locally first (we'll integrate Vercel or Fly.io later).

2. 📂 **Set Up the Project Structure**
   - Use `app/page.tsx` to render a basic frame card.
   - Display:
     - Title: “Upcoming On-Chain Events”
     - A list of 1–3 upcoming events pulled from an external API (`/api/events` for now).
     - Each event should include:
       - Event title
       - Timestamp (human readable)
       - Action buttons: `[Snooze 6h]`, `[View Tx]`

3. 📲 **Implement Action Buttons**
   - Use `<FrameButton>` with `postUrl` that calls an internal endpoint like `/api/snooze`.
   - When the “Snooze 6h” button is clicked, it should POST to the backend with the event ID.
   - The server should return a confirmation frame (e.g., “Reminder delayed by 6 hours.”).

4. 🔐 **Use the Farcaster Frame Signature Verification**
   - Verify the Frame signer using `@farcaster/auth` or the built-in tools in `@farcaster/core`.
   - Required to ensure user actions are valid and secure.

5. 🔗 **Connect to Backend API**
   - Use `fetch('/api/events')` to pull dummy event data for now.
   - Sample data format:
     ```json
     [
       {
         "id": "evt_123",
         "title": "DAO Vote #52 Closes",
         "timestamp": "2025-07-05T14:00:00Z",
         "txUrl": "https://etherscan.io/tx/0xabc..."
       }
     ]
     ```

6. 🧪 **Test the Frame Flow**
   - Use [Farcaster Frame Validator](https://farcaster-frame-validator.vercel.app/) to ensure image, metadata, and buttons are correct.
   - Use `curl` or Warpcast’s “dev mode” to preview the Frame.
   - Ensure every button interaction routes back to the right handler and updates state.

7. 🚀 **Deploy**
   - Deploy to **Vercel** or **Fly.io**
   - Make sure the app is accessible publicly (HTTPS) and returns proper meta tags for `<meta property="fc:frame">`

8. 📎 **Extras / Stretch Goals**
   - Add snooze lead-time configuration buttons: [Snooze 2h], [6h], [24h]
   - Display user’s ENS or wallet address on the confirmation screen if available.
   - Add support for “Add to Calendar” button using `ics` file download.

The goal is to create a fully interactive Farcaster Mini App that users can interact with inside Warpcast to manage upcoming blockchain-related events.

Output code files in Next.js 14+ format using TypeScript, and organize clearly with `/app`, `/lib`, `/api`, and `/components` folders.
