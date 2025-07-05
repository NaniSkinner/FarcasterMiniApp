import { NextResponse } from 'next/server'

const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3002'

export async function GET() {
  const farcasterConfig = {
    // TODO: Generate this using Warpcast mobile app
    // 1. Open Warpcast → Settings → Developer → Domains
    // 2. Enter your domain and click "Generate domain manifest"
    // 3. Replace the empty values below with the generated JSON
    accountAssociation: {
      header: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9', // REPLACE WITH ACTUAL HEADER
      payload:
        'eyJkb21haW4iOiJleGFtcGxlLmNvbSIsImZpZCI6MSwidGltZXN0YW1wIjoxNzM2MTIzNDU2fQ', // REPLACE WITH ACTUAL PAYLOAD
      signature: 'signature_here', // REPLACE WITH ACTUAL SIGNATURE
    },
    frame: {
      version: '1',
      name: 'ChainCal - On-Chain Calendar',
      iconUrl: `${appUrl}/images/icon.svg`,
      homeUrl: `${appUrl}/miniapp`,
      imageUrl: `${appUrl}/images/feed.svg`,
      screenshotUrls: [`${appUrl}/images/splash.svg`],
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

  return NextResponse.json(farcasterConfig, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  })
}
