import express from 'express'
import cors from 'cors'
import * as dotenv from 'dotenv'
import path from 'path'
import { db } from './db'
import { events } from './db/schema'
import { desc, gte, sql, eq } from 'drizzle-orm'
import { z } from 'zod'
import ical from 'ical-generator'

// Load environment variables
const envPath = path.join(__dirname, '../../../.env')
console.log('Loading .env from:', envPath)
dotenv.config({
  path: envPath,
})

console.log('✅ .env file loaded successfully')
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL)

const app = express()
const port = process.env.API_PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Get upcoming events
app.get('/events/upcoming', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10
    const now = new Date()

    console.log(`📅 Fetching upcoming events (limit: ${limit})`)

    const upcomingEvents = await db
      .select()
      .from(events)
      .where(gte(events.nextTimestamp, now))
      .orderBy(events.nextTimestamp)
      .limit(limit)

    console.log(`✅ Found ${upcomingEvents.length} upcoming events`)

    res.json({
      events: upcomingEvents,
      count: upcomingEvents.length,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('❌ Error fetching upcoming events:', error)
    res.status(500).json({
      error: 'Failed to fetch upcoming events',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Get all events (for dashboard)
app.get('/events', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50
    const offset = parseInt(req.query.offset as string) || 0

    console.log(`📋 Fetching all events (limit: ${limit}, offset: ${offset})`)

    const allEvents = await db
      .select()
      .from(events)
      .orderBy(desc(events.createdAt))
      .limit(limit)
      .offset(offset)

    // Get total count
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(events)

    console.log(
      `✅ Found ${allEvents.length} events (total: ${totalCount[0].count})`
    )

    res.json({
      events: allEvents,
      count: allEvents.length,
      total: totalCount[0].count,
      limit,
      offset,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Error fetching events:', error)
    res.status(500).json({
      error: 'Failed to fetch events',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Create new event subscription
const createEventSchema = z.object({
  contractAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid contract address'),
  eventSignature: z.string().min(1, 'Event signature is required'),
  eventArgs: z.record(z.any()).optional().default({}),
  nextTimestamp: z.string().datetime().optional(),
})

app.post('/events', async (req, res) => {
  try {
    console.log('📝 Creating new event subscription:', req.body)

    const validatedData = createEventSchema.parse(req.body)

    // If no nextTimestamp provided, set it to 1 hour from now as default
    const nextTimestamp = validatedData.nextTimestamp
      ? new Date(validatedData.nextTimestamp)
      : new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    const newEvent = await db
      .insert(events)
      .values({
        contractAddress: validatedData.contractAddress,
        eventSignature: validatedData.eventSignature,
        eventArgs: validatedData.eventArgs,
        nextTimestamp,
      })
      .returning()

    console.log('✅ Event subscription created:', newEvent[0])

    res.status(201).json({
      event: newEvent[0],
      message: 'Event subscription created successfully',
    })
  } catch (error) {
    console.error('❌ Error creating event:', error)

    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      })
    } else {
      res.status(500).json({
        error: 'Failed to create event subscription',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
})

// Snooze event (update nextTimestamp)
const snoozeEventSchema = z.object({
  duration: z
    .number()
    .min(1)
    .max(24 * 60 * 60 * 1000), // Max 24 hours in milliseconds
})

// @ts-ignore - Express 5.x type compatibility issue
app.patch('/events/:id/snooze', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id)
    const { duration } = snoozeEventSchema.parse(req.body)

    console.log(`😴 Snoozing event ${eventId} for ${duration}ms`)

    const now = new Date()
    const newTimestamp = new Date(now.getTime() + duration)

    const updatedEvent = await db
      .update(events)
      .set({
        nextTimestamp: newTimestamp,
        updatedAt: now,
      })
      .where(eq(events.id, eventId))
      .returning()

    if (updatedEvent.length === 0) {
      return res.status(404).json({ error: 'Event not found' })
    }

    console.log('✅ Event snoozed successfully:', updatedEvent[0])

    res.json({
      event: updatedEvent[0],
      message: `Event snoozed until ${newTimestamp.toISOString()}`,
    })
  } catch (error) {
    console.error('❌ Error snoozing event:', error)

    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      })
    } else {
      res.status(500).json({
        error: 'Failed to snooze event',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
})

// iCal feed endpoint
app.get('/calendar.ics', async (req, res) => {
  try {
    console.log('📅 Generating iCal feed...')

    // Fetch all upcoming events
    const upcomingEvents = await db
      .select()
      .from(events)
      .where(gte(events.nextTimestamp, new Date()))
      .orderBy(desc(events.nextTimestamp))

    console.log(
      `📅 Found ${upcomingEvents.length} upcoming events for iCal feed`
    )

    // Create calendar
    const calendar = ical({
      name: 'ChainCal - On-Chain Events',
      description: 'Your on-chain event reminders and notifications',
      timezone: 'UTC',
      url: 'http://localhost:3001/calendar.ics',
      ttl: 60 * 10, // 10 minutes cache
    })

    // Add events to calendar
    for (const event of upcomingEvents) {
      const eventName = event.eventSignature.split('(')[0]
      const contractShort = `${event.contractAddress.slice(0, 6)}...${event.contractAddress.slice(-4)}`

      // @ts-ignore - ical-generator type compatibility issues
      const calendarEvent = calendar.createEvent({
        start: new Date(event.nextTimestamp),
        end: new Date(new Date(event.nextTimestamp).getTime() + 60 * 60 * 1000), // 1 hour duration
        summary: `🔔 ${eventName}`,
        description: `On-chain event reminder\n\nContract: ${event.contractAddress}\nEvent: ${event.eventSignature}\nEvent ID: #${event.id}\n\nManage at: http://localhost:3003`,
        location: `Ethereum - ${contractShort}`,
        url: `http://localhost:3003/events/${event.id}`,
        // @ts-ignore - ical-generator uid type issue
        uid: `chaincal-${event.id}@localhost`,
      })
    }

    // Set proper headers for iCal
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="chaincal.ics"')
    res.setHeader('Cache-Control', 'public, max-age=600') // 10 minutes cache

    // Send the calendar
    // @ts-ignore - ical-generator type compatibility
    res.send(calendar.toString())

    console.log('📅 iCal feed generated successfully')
  } catch (error) {
    console.error('❌ Failed to generate iCal feed:', error)
    res.status(500).json({
      error: 'Failed to generate calendar feed',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('💥 Unhandled error:', err)
    res.status(500).json({
      error: 'Internal server error',
      message: err.message,
    })
    next()
  }
)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Start server
app.listen(port, () => {
  console.log(`🚀 ChainCal API server running on port ${port}`)
  console.log(`📡 Health check: http://localhost:${port}/health`)
  console.log(`📅 Upcoming events: http://localhost:${port}/events/upcoming`)
  console.log(`📋 All events: http://localhost:${port}/events`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully')
  process.exit(0)
})
