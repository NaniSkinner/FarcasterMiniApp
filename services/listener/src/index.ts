import express, { Request, Response } from 'express'
import * as crypto from 'crypto'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { db } from './db'
import { events } from './db/schema'

// Add process error handlers to catch any uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Use absolute path to ensure we find the .env file
const envPath = path.join(__dirname, '../../../.env')
console.log('Loading .env from:', envPath)
const result = dotenv.config({ path: envPath })

if (result.error) {
  console.error('Error loading .env file:', result.error)
} else {
  console.log('✅ .env file loaded successfully')
  console.log('ALCHEMY_SIGNING_KEY present:', !!process.env.ALCHEMY_SIGNING_KEY)
}

const app = express()
const PORT = process.env.PORT || 3000

interface RequestWithRawBody extends Request {
  rawBody: Buffer
}

// Middleware to grab the raw body, which we need for signature validation
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf
    },
  })
)

app.get('/health', (req, res) => {
  console.log('Health check requested')
  res.status(200).send('OK')
})

app.post('/webhook', async (req: Request, res: Response) => {
  console.log('🔔 Webhook request received!')
  try {
    // 1. Get signature and key from environment
    const signature = req.headers['x-alchemy-signature'] as string
    const signingKey = process.env.ALCHEMY_SIGNING_KEY

    console.log('Signature present:', !!signature)
    console.log('Signing key present:', !!signingKey)

    if (!signature || !signingKey) {
      console.error('❌ Error: Webhook signature or signing key is missing.')
      res.status(401).send('Signature or signing key missing')
      return
    }

    // 2. Get the raw request body
    const body = (req as RequestWithRawBody).rawBody
    if (!body) {
      console.error('❌ Error: Request body is missing.')
      res.status(400).send('Request body is missing')
      return
    }

    console.log('Body length:', body.length)

    // 3. Compute the HMAC digest and compare
    const hmac = crypto.createHmac('sha256', signingKey)
    hmac.update(body)
    const digest = hmac.digest('hex')

    console.log('Computed digest:', digest)
    console.log('Received signature:', signature)

    const isValid = crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(signature)
    )

    if (!isValid) {
      console.error('❌ Error: Invalid webhook signature.')
      res.status(401).send('Invalid signature')
      return
    }

    // If we reach here, the signature is valid
    console.log('✅ Webhook signature validated!')

    // 4. Parse the webhook data based on the real Alchemy structure
    const webhookData = req.body
    const blockData = webhookData.event?.data?.block

    if (!blockData || !blockData.logs) {
      console.log('ℹ️ No block data or logs found in webhook')
      res.status(200).send('No relevant data to process')
      return
    }

    const logs = blockData.logs
    console.log(
      `📝 Processing ${logs.length} log(s) from block ${blockData.number}`
    )

    if (logs.length === 0) {
      console.log('ℹ️ No events in this block - webhook processed successfully')
      res.status(200).send('No events to process')
      return
    }

    // 5. Process each log entry (contract event)
    for (const log of logs) {
      try {
        // Extract event data from the log
        const contractAddress = log.address
        const topics = log.topics || []
        const eventSignature = topics[0] || 'Unknown Event'

        // For now, we'll store the raw log data as event_args
        // In a real implementation, you'd decode this based on the ABI
        const eventArgs = {
          topics: topics,
          data: log.data,
          transactionHash: log.transactionHash,
          blockNumber: blockData.number,
          blockHash: blockData.hash,
        }

        // Calculate next timestamp (24 hours from now for this example)
        const nextTimestamp = new Date(Date.now() + 24 * 60 * 60 * 1000)

        const newEvent = {
          contractAddress: contractAddress,
          eventSignature: eventSignature,
          eventArgs: eventArgs,
          nextTimestamp: nextTimestamp,
        }

        console.log('💾 Inserting event:', {
          contract: contractAddress,
          signature: eventSignature,
          nextReminder: nextTimestamp.toISOString(),
        })

        // Insert into database
        await db.insert(events).values(newEvent)
        console.log('✅ Event inserted successfully!')
      } catch (eventError) {
        console.error('❌ Error processing individual event:', eventError)
        // Continue processing other events even if one fails
      }
    }

    res.status(200).send(`Processed ${logs.length} event(s) successfully`)
  } catch (error) {
    console.error('❌ Unexpected error processing webhook:', error)
    res.status(500).send('An unexpected error occurred.')
  }
})

const server = app.listen(PORT, () => {
  console.log(`🚀 Listener service is stable and running on port ${PORT}`)
  console.log('Ready to process real contract events!')
})

server.on('error', (error) => {
  console.error('❌ Server error:', error)
})

// Keep the process alive
setInterval(() => {
  console.log('🔄 Server heartbeat - still running...')
}, 60000) // Log every 60 seconds
