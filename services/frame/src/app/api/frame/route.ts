/* eslint-disable react/jsx-key */
import { frames } from '../../frames'
import { Button } from 'frames.js/next'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001'

interface Event {
  id: number
  contractAddress: string
  eventSignature: string
  eventArgs: Record<string, any>
  nextTimestamp: string
  createdAt: string
  updatedAt: string
}

interface EventsResponse {
  events: Event[]
  count: number
  timestamp: string
}

function formatEvent(event: Event): string {
  const date = new Date(event.nextTimestamp)
  const timeStr = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const contractShort = `${event.contractAddress.slice(0, 6)}...${event.contractAddress.slice(-4)}`
  const eventName = event.eventSignature.split('(')[0]

  return `${eventName} @ ${contractShort}\n${timeStr}`
}

async function fetchUpcomingEvents(): Promise<Event[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/upcoming?limit=5`)
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }
    const data: EventsResponse = await response.json()
    return data.events
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

async function snoozeEvent(
  eventId: number,
  durationMs: number
): Promise<boolean> {
  try {
    console.log(`🔔 Frame: Snoozing event ${eventId} for ${durationMs}ms`)

    const response = await fetch(`${API_BASE_URL}/events/${eventId}/snooze`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration: durationMs }),
    })

    if (!response.ok) {
      console.error(
        `❌ Frame: Failed to snooze event ${eventId}: ${response.status}`
      )
      return false
    }

    console.log(`✅ Frame: Successfully snoozed event ${eventId}`)
    return true
  } catch (error) {
    console.error('❌ Frame: Error snoozing event:', error)
    return false
  }
}

const handleRequest = frames(async (ctx) => {
  // Check if this is a POST request (button click)
  const isPost = ctx.request.method === 'POST'
  const url = new URL(ctx.request.url)
  const eventId = url.searchParams.get('eventId')

  // Handle snooze action
  if (isPost && eventId) {
    const eventIdNum = parseInt(eventId)
    const oneHourMs = 60 * 60 * 1000 // 1 hour in milliseconds

    console.log(`🔔 Frame: Processing snooze for event ${eventIdNum}`)

    const snoozeSuccess = await snoozeEvent(eventIdNum, oneHourMs)

    if (snoozeSuccess) {
      // Show success message
      return {
        image: `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background-color: #f0fdf4; font-size: 20px; color: #166534; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
            <div style="font-weight: bold; margin-bottom: 10px;">Event Snoozed!</div>
            <div style="font-size: 16px; text-align: center; margin-bottom: 20px;">
              Reminder moved 1 hour forward
            </div>
            <div style="font-size: 14px; color: #065f46;">
              You'll receive a new notification in 1 hour
            </div>
          </div>
        `,
        buttons: [
          { label: 'View All Events', action: 'post', target: '/' },
          {
            label: 'Dashboard',
            action: 'link',
            target: 'http://localhost:3003',
          },
        ],
      }
    } else {
      // Show error message
      return {
        image: `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background-color: #fef2f2; font-size: 20px; color: #dc2626; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
            <div style="font-weight: bold; margin-bottom: 10px;">Snooze Failed</div>
            <div style="font-size: 16px; text-align: center; margin-bottom: 20px;">
              Could not update reminder time
            </div>
            <div style="font-size: 14px; color: #7f1d1d;">
              Please try again or use the web dashboard
            </div>
          </div>
        `,
        buttons: [
          { label: 'Try Again', action: 'post', target: '/' },
          {
            label: 'Dashboard',
            action: 'link',
            target: 'http://localhost:3003',
          },
        ],
      }
    }
  }

  // Default behavior: Show upcoming events (GET request or POST without eventId)
  const events = await fetchUpcomingEvents()

  if (events.length === 0) {
    return {
      image: `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background-color: #f0f8ff; font-size: 24px; font-weight: bold; color: #1e3a8a; padding: 40px;">
          <div style="font-size: 64px; margin-bottom: 20px;">📅</div>
          <div>ChainCal</div>
          <div style="font-size: 16px; font-weight: normal; margin-top: 10px;">No upcoming events</div>
        </div>
      `,
      buttons: [
        {
          label: 'Dashboard',
          action: 'link',
          target: 'http://localhost:3003',
        },
      ],
    }
  }

  const firstEvent = events[0]
  const eventText = formatEvent(firstEvent)

  return {
    image: `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background-color: #fff7ed; font-size: 20px; color: #1f2937; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 20px;">🔔</div>
        <div style="font-weight: bold; margin-bottom: 10px;">Upcoming Event</div>
        <div style="font-size: 16px; text-align: center; background-color: #f3f4f6; padding: 20px; border-radius: 8px; white-space: pre-line;">
          ${eventText}
        </div>
      </div>
    `,
    buttons: [
      { label: 'Refresh', action: 'post', target: '/' },
      {
        label: 'Snooze 1h',
        action: 'post',
        target: `/?eventId=${firstEvent.id}`,
      },
    ],
  }
})

export const GET = handleRequest
export const POST = handleRequest
