import express, { Request, Response } from 'express'
import * as crypto from 'crypto'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

const app = express()
const PORT = 3000

// Use express.json() middleware to parse raw request body
// and a custom 'verify' function to validate the signature.
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      // This is crucial for signature validation.
      // We need the raw, unparsed request body.
      req.rawBody = buf
    },
  })
)

app.post('/webhook', (req: Request, res: Response) => {
  console.log('---')
  console.log(`Received webhook at ${new Date().toISOString()}`)

  // 1. Get the signature from the headers
  const signature = req.headers['x-alchemy-signature'] as string
  if (!signature) {
    console.error('❌ Missing X-Alchemy-Signature header')
    res.status(400).send('Missing signature')
    return
  }

  // 2. Get your signing key from .env
  const signingKey = process.env.ALCHEMY_SIGNING_KEY
  if (!signingKey) {
    console.error('❌ ALCHEMY_SIGNING_KEY is not set in the .env file')
    res.status(500).send('Server configuration error')
    return
  }

  // 3. Get the raw request body
  const body = (req as any).rawBody

  if (!body) {
    console.error(
      '❌ Request body is missing. This can happen if the verify function failed.'
    )
    res.status(400).send('Missing request body')
    return
  }

  try {
    // 4. Compute the HMAC signature and compare
    const hmac = crypto.createHmac('sha256', signingKey)
    hmac.update(body)
    const digest = hmac.digest('hex')

    const isValid = crypto.timingSafeEqual(
      Buffer.from(digest),
      Buffer.from(signature)
    )

    if (isValid) {
      console.log('✅ Signature is valid!')
      console.log('Request Body:', req.body)
      res.status(200).send('Webhook received and validated!')
    } else {
      console.error('❌ Invalid signature.')
      res.status(401).send('Invalid signature')
    }
  } catch (error) {
    console.error('Error during signature validation:', error)
    res.status(500).send('Error validating webhook')
  }
})

app.listen(PORT, () => {
  console.log('🧪 Alchemy Webhook test server is running.')
  console.log(`Listening for webhooks on http://localhost:${PORT}/webhook`)
  console.log('---')
  console.log('Next steps:')
  console.log('1. Go to your Alchemy Dashboard -> Webhooks.')
  console.log(
    '2. Add a new webhook with this URL (you may need a tool like ngrok to expose localhost).'
  )
  console.log(
    '3. Find the "Signing Key" for your webhook and add it to your .env file as ALCHEMY_SIGNING_KEY.'
  )
  console.log('4. Click "Test Webhook" in the Alchemy dashboard.')
})
