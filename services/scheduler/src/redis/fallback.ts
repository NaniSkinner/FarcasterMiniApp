// Simple in-memory fallback for Redis when not available
class InMemoryQueue {
  private reminders: Map<number, number> = new Map() // eventId -> timestamp

  async addReminder(eventId: number, timestamp: Date): Promise<void> {
    this.reminders.set(eventId, timestamp.getTime())
    console.log(
      `📅 Added reminder for event ${eventId} at ${timestamp.toISOString()} (in-memory)`
    )
  }

  async getDueReminders(): Promise<number[]> {
    const now = Date.now()
    const dueEvents: number[] = []

    for (const [eventId, timestamp] of this.reminders.entries()) {
      if (timestamp <= now) {
        dueEvents.push(eventId)
      }
    }

    return dueEvents
  }

  async removeReminder(eventId: number): Promise<void> {
    this.reminders.delete(eventId)
    console.log(`🗑️ Removed reminder for event ${eventId} (in-memory)`)
  }

  async updateReminder(eventId: number, newTimestamp: Date): Promise<void> {
    this.reminders.set(eventId, newTimestamp.getTime())
    console.log(
      `🔄 Updated reminder for event ${eventId} to ${newTimestamp.toISOString()} (in-memory)`
    )
  }

  async getAllReminders(): Promise<
    Array<{ eventId: number; timestamp: Date }>
  > {
    const reminders = []
    for (const [eventId, timestamp] of this.reminders.entries()) {
      reminders.push({ eventId, timestamp: new Date(timestamp) })
    }
    return reminders
  }
}

export const fallbackQueue = new InMemoryQueue()
