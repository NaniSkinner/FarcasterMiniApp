import * as cron from 'node-cron'
import { db, events } from './db'
import { ReminderQueue, redis } from './redis'
import { fallbackQueue } from './redis/fallback'
import { EmailService } from './email'
import { eq, lte } from 'drizzle-orm'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables - find project root
const projectRoot = path.resolve(__dirname, '../../..')
dotenv.config({
  path: path.join(projectRoot, '.env'),
})

console.log('🚀 ChainCal Scheduler starting...')

// Initialize services
const emailService = new EmailService()

// Event interface
interface Event {
  id: number
  contractAddress: string
  eventSignature: string
  eventArgs: Record<string, any>
  nextTimestamp: Date
  createdAt: Date
  updatedAt: Date
}

// Main scheduler class
class ReminderScheduler {
  private isRunning = false

  async start() {
    console.log('📅 Starting reminder scheduler...')

    // Test connections
    await this.testConnections()

    // Initialize reminders from database
    await this.initializeReminders()

    // Start cron job - runs every minute
    cron.schedule('* * * * *', async () => {
      if (this.isRunning) {
        console.log('⏳ Previous job still running, skipping...')
        return
      }

      this.isRunning = true
      try {
        await this.processReminders()
      } catch (error) {
        console.error('❌ Error processing reminders:', error)
      } finally {
        this.isRunning = false
      }
    })

    console.log('✅ Reminder scheduler started (runs every minute)')
    console.log('🔄 Waiting for reminders...')
  }

  private async testConnections() {
    console.log('🔍 Testing service connections...')

    // Test database
    try {
      await db.select().from(events).limit(1)
      console.log('✅ Database connection OK')
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      process.exit(1)
    }

    // Test Redis (optional)
    try {
      if (redis) {
        await redis.ping()
        console.log('✅ Redis connection OK')
      } else {
        console.log('⚠️  Redis not available, using in-memory fallback')
      }
    } catch (error) {
      console.error(
        '❌ Redis connection failed, using in-memory fallback:',
        error instanceof Error ? error.message : String(error)
      )
    }

    // Test email (optional)
    await emailService.testConnection()
  }

  private async initializeReminders() {
    console.log('🔄 Initializing reminders from database...')

    try {
      // Get all upcoming events
      const upcomingEvents = await db
        .select()
        .from(events)
        .where(
          lte(
            events.nextTimestamp,
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          )
        ) // Next 7 days

      // Add them to queue (Redis or fallback)
      for (const event of upcomingEvents) {
        if (redis) {
          await ReminderQueue.addReminder(event.id, event.nextTimestamp)
        } else {
          await fallbackQueue.addReminder(event.id, event.nextTimestamp)
        }
      }

      console.log(`📅 Initialized ${upcomingEvents.length} reminders`)
    } catch (error) {
      console.error('❌ Failed to initialize reminders:', error)
    }
  }

  private async processReminders() {
    // Get due reminders from queue (Redis or fallback)
    const dueEventIds = redis
      ? await ReminderQueue.getDueReminders()
      : await fallbackQueue.getDueReminders()

    if (dueEventIds.length === 0) {
      return // No reminders due
    }

    console.log(`🔔 Processing ${dueEventIds.length} due reminder(s)`)

    for (const eventId of dueEventIds) {
      try {
        await this.processReminder(eventId)
      } catch (error) {
        console.error(
          `❌ Failed to process reminder for event ${eventId}:`,
          error
        )
      }
    }
  }

  private async processReminder(eventId: number) {
    // Get event details from database
    const eventResults = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1)

    if (eventResults.length === 0) {
      console.warn(
        `⚠️ Event ${eventId} not found in database, removing from queue`
      )
      if (redis) {
        await ReminderQueue.removeReminder(eventId)
      } else {
        await fallbackQueue.removeReminder(eventId)
      }
      return
    }

    const event = eventResults[0]

    // Check if reminder is actually due (double-check)
    const now = new Date()
    if (event.nextTimestamp > now) {
      console.log(
        `⏰ Event ${eventId} not yet due (${event.nextTimestamp}), skipping`
      )
      return
    }

    console.log(
      `🔔 Sending reminder for event ${eventId}: ${event.eventSignature}`
    )

    // Send email notification
    await emailService.sendReminder({
      id: event.id,
      contractAddress: event.contractAddress,
      eventSignature: event.eventSignature,
      eventArgs: event.eventArgs as Record<string, any>,
      nextTimestamp: event.nextTimestamp.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    })

    // Remove from reminder queue
    if (redis) {
      await ReminderQueue.removeReminder(eventId)
    } else {
      await fallbackQueue.removeReminder(eventId)
    }

    console.log(`✅ Processed reminder for event ${eventId}`)
  }

  // Graceful shutdown
  async shutdown() {
    console.log('🛑 Shutting down scheduler...')
    if (redis) {
      await redis.disconnect()
    }
    console.log('✅ Scheduler shutdown complete')
  }
}

// Create and start scheduler
const scheduler = new ReminderScheduler()

// Start the scheduler
scheduler.start().catch((error) => {
  console.error('💥 Failed to start scheduler:', error)
  process.exit(1)
})

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received')
  await scheduler.shutdown()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received')
  await scheduler.shutdown()
  process.exit(0)
})

// Keep the process alive
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled rejection at:', promise, 'reason:', reason)
  process.exit(1)
})
