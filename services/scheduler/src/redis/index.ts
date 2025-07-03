import Redis from 'ioredis'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables - find project root
const projectRoot = path.resolve(__dirname, '../../../..')
dotenv.config({
  path: path.join(projectRoot, '.env'),
})

if (!process.env.REDIS_URL) {
  console.log('⚠️  REDIS_URL not set, using in-memory fallback for development')
}

// Create Redis connection with error handling
let redis: Redis | null = null

if (process.env.REDIS_URL) {
  try {
    // Parse the Redis URL to extract components
    const url = new URL(process.env.REDIS_URL)

    redis = new Redis({
      host: url.hostname,
      port: parseInt(url.port),
      username: url.username || 'default',
      password: url.password,
      family: 4,
      connectTimeout: 10000,
      lazyConnect: true,

      maxRetriesPerRequest: 3,
      tls: {},
    })

    redis.on('connect', () => {
      console.log('✅ Connected to Redis')
    })

    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error)
    })
  } catch (error) {
    console.error('❌ Failed to create Redis connection:', error)
    redis = null
  }
}

export { redis }

// Helper functions for managing reminder queue
export class ReminderQueue {
  private static readonly QUEUE_KEY = 'chaincal:reminders'

  // Add a reminder to the queue
  static async addReminder(eventId: number, timestamp: Date): Promise<void> {
    const score = timestamp.getTime()
    await redis.zadd(ReminderQueue.QUEUE_KEY, score, eventId.toString())
    console.log(
      `📅 Added reminder for event ${eventId} at ${timestamp.toISOString()}`
    )
  }

  // Get reminders that are due (timestamp <= now)
  static async getDueReminders(): Promise<number[]> {
    const now = Date.now()
    const results = await redis.zrangebyscore(ReminderQueue.QUEUE_KEY, 0, now)
    return results.map((id) => parseInt(id))
  }

  // Remove a reminder from the queue
  static async removeReminder(eventId: number): Promise<void> {
    await redis.zrem(ReminderQueue.QUEUE_KEY, eventId.toString())
    console.log(`🗑️ Removed reminder for event ${eventId}`)
  }

  // Update reminder timestamp
  static async updateReminder(
    eventId: number,
    newTimestamp: Date
  ): Promise<void> {
    const score = newTimestamp.getTime()
    await redis.zadd(ReminderQueue.QUEUE_KEY, score, eventId.toString())
    console.log(
      `🔄 Updated reminder for event ${eventId} to ${newTimestamp.toISOString()}`
    )
  }

  // Get all reminders (for debugging)
  static async getAllReminders(): Promise<
    Array<{ eventId: number; timestamp: Date }>
  > {
    const results = await redis.zrange(
      ReminderQueue.QUEUE_KEY,
      0,
      -1,
      'WITHSCORES'
    )
    const reminders = []

    for (let i = 0; i < results.length; i += 2) {
      const eventId = parseInt(results[i])
      const timestamp = new Date(parseInt(results[i + 1]))
      reminders.push({ eventId, timestamp })
    }

    return reminders
  }
}
