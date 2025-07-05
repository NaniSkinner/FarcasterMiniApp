import { NextResponse } from 'next/server'

const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3002'

export async function GET() {
  const farcasterConfig = {
    // Account association will be filled when publishing
    accountAssociation: {
      header: '',
      payload: '',
      signature: '',
    },
    frame: {
      version: '1',
      name: 'ChainCal - On-Chain Calendar',
      iconUrl: `${appUrl}/images/icon.png`,
      homeUrl: `${appUrl}`,
      imageUrl: `${appUrl}/images/feed.png`,
      screenshotUrls: [],
      tags: ['ethereum', 'calendar', 'defi', 'reminders', 'blockchain'],
      primaryCategory: 'productivity',
      buttonTitle: 'Open ChainCal',
      splashImageUrl: `${appUrl}/images/splash.png`,
      splashBackgroundColor: '#f0f8ff',
    },
  }

  return NextResponse.json(farcasterConfig)
}
