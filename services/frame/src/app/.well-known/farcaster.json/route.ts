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
      iconUrl: `${appUrl}/images/icon.svg`,
      homeUrl: `${appUrl}/miniapp`,
      imageUrl: `${appUrl}/images/feed.svg`,
      screenshotUrls: [],
      tags: ['ethereum', 'calendar', 'defi', 'reminders', 'blockchain'],
      primaryCategory: 'productivity',
      buttonTitle: 'Open ChainCal',
      splashImageUrl: `${appUrl}/images/splash.svg`,
      splashBackgroundColor: '#f0f8ff',
    },
    // Mini App configuration
    miniApp: {
      name: 'ChainCal - On-Chain Calendar',
      description:
        'Your personal blockchain calendar for smart contract event reminders',
      iconUrl: `${appUrl}/images/icon.svg`,
      url: `${appUrl}/miniapp`,
      manifestUrl: `${appUrl}/.well-known/farcaster.json`,
      splashImageUrl: `${appUrl}/images/splash.svg`,
      splashBackgroundColor: '#f0f8ff',
      tags: ['ethereum', 'calendar', 'defi', 'reminders', 'blockchain'],
      category: 'productivity',
    },
  }

  return NextResponse.json(farcasterConfig)
}
