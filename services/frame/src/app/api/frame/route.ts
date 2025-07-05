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
  // Extract user context from Farcaster
  const userFid = ctx.message?.requesterFid
  const message = ctx.message as any // Type assertion for user data access
  const userUsername = message?.requesterUserData?.username
  const userDisplayName = message?.requesterUserData?.displayName

  // Check if this is a POST request (button click)
  const isPost = ctx.request.method === 'POST'
  const url = new URL(ctx.request.url)
  const eventId = url.searchParams.get('eventId')
  const action = url.searchParams.get('action')

  // Log user interaction for debugging
  if (userFid) {
    console.log(
      `👤 Frame User: FID ${userFid}, Username: @${userUsername || 'unknown'}, Display: ${userDisplayName || 'N/A'}`
    )
  }

  // Handle snooze action
  if (isPost && eventId) {
    const eventIdNum = parseInt(eventId)
    const oneHourMs = 60 * 60 * 1000 // 1 hour in milliseconds

    console.log(`🔔 Frame: Processing snooze for event ${eventIdNum}`)

    const snoozeSuccess = await snoozeEvent(eventIdNum, oneHourMs)

    if (snoozeSuccess) {
      // Show personalized success message
      const greeting = userDisplayName
        ? `${userDisplayName}`
        : userUsername
          ? `@${userUsername}`
          : userFid
            ? `User #${userFid}`
            : 'User'

      return {
        image: `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background-color: #f0fdf4; font-size: 20px; color: #166534; padding: 40px;">
            <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
            <div style="font-weight: bold; margin-bottom: 10px;">Event Snoozed, ${greeting}!</div>
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
            target: 'http://localhost:3004',
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
            target: 'http://localhost:3004',
          },
        ],
      }
    }
  }

  // Handle "My Stats" action
  if (isPost && action === 'my-stats' && userFid) {
    const allEvents = await fetch(`${API_BASE_URL}/events`)
      .then((res) => res.json())
      .catch(() => ({ events: [], count: 0 }))
    const upcomingEvents = await fetchUpcomingEvents()

    const greeting = userDisplayName
      ? `${userDisplayName}`
      : userUsername
        ? `@${userUsername}`
        : `User #${userFid}`

    return {
      image: `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background-color: #f8fafc; font-size: 18px; color: #1f2937; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 20px;">📊</div>
          <div style="font-weight: bold; margin-bottom: 20px; font-size: 22px;">${greeting}'s Stats</div>
          
          <div style="display: flex; flex-direction: column; gap: 15px; text-align: center;">
            <div style="background-color: #e0f2fe; padding: 15px; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #0369a1;">${allEvents.count || 0}</div>
              <div style="font-size: 14px; color: #0c4a6e;">Total Events</div>
            </div>
            
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px;">
              <div style="font-size: 24px; font-weight: bold; color: #166534;">${upcomingEvents.length}</div>
              <div style="font-size: 14px; color: #14532d;">Upcoming</div>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px;">
              <div style="font-size: 18px; font-weight: bold; color: #92400e;">FID ${userFid}</div>
              <div style="font-size: 14px; color: #78350f;">Your Farcaster ID</div>
            </div>
          </div>
        </div>
      `,
      buttons: [
        { label: 'Back to Events', action: 'post', target: '/' },
        {
          label: 'Dashboard',
          action: 'link',
          target: 'http://localhost:3004',
        },
      ],
    }
  }

  // Default behavior: Show upcoming events (GET request or POST without eventId)
  const events = await fetchUpcomingEvents()

  if (events.length === 0) {
    // Personalized greeting for no events
    const greeting = userDisplayName
      ? `${userDisplayName}`
      : userUsername
        ? `@${userUsername}`
        : userFid
          ? `User #${userFid}`
          : ''
    const personalizedMessage = greeting
      ? `Welcome ${greeting}!`
      : 'Welcome to ChainCal!'

    return {
      image: `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background-color: #f0f8ff; font-size: 24px; font-weight: bold; color: #1e3a8a; padding: 40px;">
          <div style="font-size: 64px; margin-bottom: 20px;">📅</div>
          <div>ChainCal</div>
          <div style="font-size: 18px; font-weight: normal; margin-top: 10px; margin-bottom: 5px;">${personalizedMessage}</div>
          <div style="font-size: 16px; font-weight: normal;">No upcoming events</div>
        </div>
      `,
      buttons: userFid
        ? [
            {
              label: 'Dashboard',
              action: 'link',
              target: 'http://localhost:3004',
            },
            { label: 'My Stats', action: 'post', target: '/?action=my-stats' },
          ]
        : [
            {
              label: 'Dashboard',
              action: 'link',
              target: 'http://localhost:3004',
            },
          ],
    }
  }

  const firstEvent = events[0]
  const eventText = formatEvent(firstEvent)

  // Personalized greeting for events
  const greeting = userDisplayName
    ? `${userDisplayName}`
    : userUsername
      ? `@${userUsername}`
      : userFid
        ? `User #${userFid}`
        : ''
  const personalizedTitle = greeting
    ? `${greeting}'s Next Event`
    : 'Upcoming Event'

  return {
    image: `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background-color: #fff7ed; font-size: 20px; color: #1f2937; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 20px;">🔔</div>
        <div style="font-weight: bold; margin-bottom: 10px;">${personalizedTitle}</div>
        <div style="font-size: 16px; text-align: center; background-color: #f3f4f6; padding: 20px; border-radius: 8px; white-space: pre-line;">
          ${eventText}
        </div>
        ${userFid ? `<div style="font-size: 12px; margin-top: 15px; color: #6b7280;">FID: ${userFid}</div>` : ''}
      </div>
    `,
    buttons: userFid
      ? [
          { label: 'Refresh', action: 'post', target: '/' },
          {
            label: 'Snooze 1h',
            action: 'post',
            target: `/?eventId=${firstEvent.id}`,
          },
          { label: 'My Stats', action: 'post', target: '/?action=my-stats' },
        ]
      : [
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
