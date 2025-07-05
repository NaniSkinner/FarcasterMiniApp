'use client'

import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

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

  return `${eventName} @ ${contractShort} - ${timeStr}`
}

export default function MiniApp() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isMinipApp, setIsMiniApp] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [currentChain, setCurrentChain] = useState<string | null>(null)
  const [chainCapabilities, setChainCapabilities] = useState<any>(null)

  // Initialize Mini App SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Check if we're running in a Mini App context
        if (typeof window !== 'undefined') {
          // Detect if we're in a Mini App vs browser
          const isMiniAppContext =
            window.location !== window.parent.location ||
            navigator.userAgent.includes('Farcaster')
          setIsMiniApp(isMiniAppContext)

          if (isMiniAppContext) {
            console.log('🚀 Mini App: Initializing Farcaster Mini App SDK')

            // Get user context using Context API
            try {
              // Access user context from the SDK (await the promise)
              const userContext = await sdk.context
              console.log('👤 Mini App User Context:', userContext)

              // Check if user data is available
              if (userContext?.user) {
                setUser(userContext.user)
                console.log('✅ Mini App: User authenticated', userContext.user)
              } else {
                console.log(
                  'ℹ️ Mini App: User context available but not authenticated'
                )

                // Quick Auth is handled by the Mini App platform automatically
                console.log('🔐 Mini App: Quick Auth handled by platform')
              }
            } catch (error) {
              console.log('ℹ️ Mini App: User context not available:', error)
            }

            // Initialize Ethereum Wallet Integration
            try {
              console.log(
                '🔗 Mini App: Initializing Ethereum wallet integration'
              )

              // Check if wallet functionality is available
              if (sdk.wallet?.ethProvider) {
                console.log('✅ Mini App: Ethereum provider available')

                // Get current chain ID
                try {
                  const chainId = await sdk.wallet.ethProvider.request({
                    method: 'eth_chainId',
                  })
                  console.log('⛓️ Mini App: Current chain ID:', chainId)
                  setCurrentChain(chainId)
                } catch (error) {
                  console.log('ℹ️ Mini App: Chain ID not available:', error)
                }

                // Get connected accounts
                try {
                  const accounts = await sdk.wallet.ethProvider.request({
                    method: 'eth_accounts',
                  })
                  console.log('👛 Mini App: Connected accounts:', accounts)

                  if (accounts && accounts.length > 0) {
                    setWalletAddress(accounts[0])
                    setWalletConnected(true)
                    console.log('✅ Mini App: Wallet connected:', accounts[0])
                  } else {
                    console.log('ℹ️ Mini App: No accounts connected')
                  }
                } catch (error) {
                  console.log('ℹ️ Mini App: Accounts not available:', error)
                }

                // Store wallet capabilities info
                setChainCapabilities({
                  hasEthProvider: true,
                  canRequestAccounts: true,
                  canSendTransactions: true,
                })
              } else {
                console.log('ℹ️ Mini App: Ethereum provider not available')
              }
            } catch (error) {
              console.error('❌ Mini App: Wallet initialization failed:', error)
            }

            // Call ready() to hide splash screen and display content
            await sdk.actions.ready()
            console.log('✅ Mini App: SDK ready, splash screen hidden')
          }
        }
      } catch (error) {
        console.error('❌ Mini App: SDK initialization failed:', error)
        // Fallback for non-Mini App contexts
        setIsMiniApp(false)
      }
    }

    initializeSDK()
  }, [])

  // Fetch upcoming events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/events/upcoming?limit=5`)
        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`)
        }
        const data: EventsResponse = await response.json()
        setEvents(data.events)
      } catch (error) {
        console.error('Error fetching events:', error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const snoozeEvent = async (eventId: number) => {
    try {
      console.log(`🔔 Mini App: Snoozing event ${eventId}`)

      const response = await fetch(`${API_BASE_URL}/events/${eventId}/snooze`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: 60 * 60 * 1000 }), // 1 hour
      })

      if (!response.ok) {
        throw new Error(`Failed to snooze event: ${response.status}`)
      }

      // Refresh events after snoozing
      const eventsResponse = await fetch(
        `${API_BASE_URL}/events/upcoming?limit=5`
      )
      if (eventsResponse.ok) {
        const data: EventsResponse = await eventsResponse.json()
        setEvents(data.events)
      }

      console.log(`✅ Mini App: Successfully snoozed event ${eventId}`)

      // Success feedback
      alert('Event snoozed for 1 hour!')
    } catch (error) {
      console.error('❌ Mini App: Error snoozing event:', error)

      // Error feedback
      alert('Failed to snooze event')
    }
  }

  const openDashboard = () => {
    if (isMinipApp && sdk.actions.openUrl) {
      sdk.actions.openUrl('http://localhost:3004')
    } else {
      window.open('http://localhost:3004', '_blank')
    }
  }

  const handleQuickAuth = async () => {
    try {
      console.log('🔐 Mini App: Initiating Quick Auth...')

      // In Mini Apps, authentication is typically handled by the platform
      // The user context will automatically update when user authenticates
      const userContext = await sdk.context
      if (userContext?.user) {
        setUser(userContext.user)
        console.log('✅ Mini App: Quick Auth successful', userContext.user)
      } else {
        console.log('ℹ️ Mini App: Quick Auth completed but no user data')
      }
    } catch (error) {
      console.error('❌ Mini App: Quick Auth failed:', error)
    }
  }

  const connectWallet = async () => {
    try {
      console.log('👛 Mini App: Requesting wallet connection...')

      if (!isMinipApp) {
        alert('Wallet connection is only available in Mini App mode')
        return
      }

      if (!sdk.wallet?.ethProvider) {
        alert('Ethereum provider not available in this client')
        throw new Error('Ethereum provider not available')
      }

      // Request account access
      const accounts = await sdk.wallet.ethProvider.request({
        method: 'eth_requestAccounts',
      })

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
        setWalletConnected(true)
        console.log('✅ Mini App: Wallet connected successfully:', accounts[0])
        alert(`Wallet connected: ${accounts[0].slice(0, 8)}...`)
      } else {
        throw new Error('No accounts returned')
      }
    } catch (error: any) {
      console.error('❌ Mini App: Wallet connection failed:', error)

      // Handle specific error types
      if (error?.code === 4001) {
        alert('Wallet connection cancelled by user')
      } else if (error?.code === -32002) {
        alert('Wallet connection request already pending')
      } else {
        alert(
          'Failed to connect wallet: ' + (error?.message || 'Unknown error')
        )
      }
    }
  }

  const switchToEthereum = async () => {
    try {
      console.log('⛓️ Mini App: Switching to Ethereum mainnet...')

      if (!walletConnected) {
        alert('Please connect your wallet first')
        return
      }

      if (!sdk.wallet?.ethProvider) {
        alert('Ethereum provider not available')
        throw new Error('Ethereum provider not available')
      }

      await sdk.wallet.ethProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }], // Ethereum mainnet
      })

      console.log('✅ Mini App: Switched to Ethereum mainnet')
      setCurrentChain('0x1')
      alert('Switched to Ethereum mainnet')
    } catch (error: any) {
      console.error('❌ Mini App: Chain switch failed:', error)

      // Handle specific error types
      if (error?.code === 4902) {
        alert(
          'Network not found in wallet. Please add Ethereum mainnet manually.'
        )
      } else if (error?.code === 4001) {
        alert('Network switch cancelled by user')
      } else {
        alert(
          'Failed to switch network: ' + (error?.message || 'Unknown error')
        )
      }
    }
  }

  const createEventSubscription = async (contractAddress: string) => {
    try {
      console.log('📝 Mini App: Creating on-chain event subscription...')

      if (!walletConnected || !walletAddress) {
        alert('Please connect your wallet first')
        return
      }

      if (!sdk.wallet?.ethProvider) {
        alert('Ethereum provider not available')
        throw new Error('Ethereum provider not available')
      }

      // Check if we're on the right network
      if (currentChain !== '0x1') {
        alert('Please switch to Ethereum mainnet first')
        return
      }

      // Show confirmation to user
      const confirmed = confirm(
        `Create on-chain subscription for contract ${contractAddress.slice(0, 8)}...?`
      )
      if (!confirmed) return

      // Example: Create a simple transaction to demonstrate wallet integration
      // In a real app, this might interact with a smart contract for subscriptions
      const transactionParams = {
        from: walletAddress as `0x${string}`,
        to: contractAddress as `0x${string}`,
        value: '0x0' as `0x${string}`, // No ETH being sent
        data: '0x' as `0x${string}`, // Empty data for demo
      }

      const txHash = await sdk.wallet.ethProvider.request({
        method: 'eth_sendTransaction',
        params: [transactionParams],
      })

      console.log('✅ Mini App: Transaction sent:', txHash)
      alert(`Transaction sent! Hash: ${txHash.slice(0, 10)}...`)
    } catch (error: any) {
      console.error('❌ Mini App: Transaction failed:', error)

      // Handle specific error types
      if (error?.code === 4001) {
        alert('Transaction cancelled by user')
      } else if (error?.code === -32000) {
        alert('Insufficient funds for transaction')
      } else if (error?.code === -32003) {
        alert('Transaction rejected by network')
      } else {
        alert('Transaction failed: ' + (error?.message || 'Unknown error'))
      }
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📅</div>
          <div className="text-xl font-semibold text-gray-700">
            Loading ChainCal...
          </div>
          {isMinipApp && (
            <div className="text-sm text-gray-500 mt-2">Mini App Mode</div>
          )}
        </div>
      </div>
    )
  }

  const greeting =
    user?.displayName ||
    user?.username ||
    (user?.fid ? `User #${user.fid}` : '')
  const personalizedTitle = greeting
    ? `${greeting}'s Events`
    : 'ChainCal Events'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2">📅</div>
          <h1 className="text-2xl font-bold text-gray-800">
            {personalizedTitle}
          </h1>
          {user && (
            <p className="text-sm text-gray-600 mt-1">
              Welcome back,{' '}
              {user.displayName || `@${user.username}` || `FID ${user.fid}`}!
            </p>
          )}
          {isMinipApp && (
            <div className="text-xs text-indigo-600 mt-1">
              🚀 Mini App Mode {user ? '• Authenticated' : '• Anonymous'}
            </div>
          )}
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              No Upcoming Events
            </h2>
            <p className="text-gray-500 text-sm">
              Your blockchain calendar is clear!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">
                      Upcoming Event
                    </div>
                    <div className="font-medium text-gray-800 mb-2">
                      {formatEvent(event)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Contract: {event.contractAddress.slice(0, 8)}...
                      {event.contractAddress.slice(-6)}
                    </div>
                  </div>
                  <div className="ml-3 space-y-1">
                    <button
                      onClick={() => snoozeEvent(event.id)}
                      className="block w-full px-3 py-1 bg-orange-100 text-orange-700 rounded-md text-sm hover:bg-orange-200 transition-colors"
                    >
                      Snooze 1h
                    </button>
                    {isMinipApp && walletConnected && (
                      <button
                        onClick={() =>
                          createEventSubscription(event.contractAddress)
                        }
                        className="block w-full px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
                        title="Create on-chain subscription"
                      >
                        Subscribe
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wallet Status */}
        {isMinipApp && chainCapabilities?.hasEthProvider && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Ethereum Wallet
              </h3>
              <div
                className={`text-xs px-2 py-1 rounded-full ${
                  walletConnected
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {walletConnected ? 'Connected' : 'Not Connected'}
              </div>
            </div>

            {walletConnected ? (
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Address</div>
                  <div className="font-mono text-sm text-gray-800">
                    {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Network</div>
                  <div className="text-sm text-gray-800">
                    {currentChain === '0x1'
                      ? 'Ethereum Mainnet'
                      : currentChain || 'Unknown'}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={switchToEthereum}
                    className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
                  >
                    Switch to Ethereum
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Connect your wallet to interact with blockchain events
                </p>
                <button
                  onClick={connectWallet}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        )}

        {/* User Stats */}
        {user && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Your Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {events.length}
                </div>
                <div className="text-xs text-gray-500">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {user.fid || 'N/A'}
                </div>
                <div className="text-xs text-gray-500">Your FID</div>
              </div>
            </div>
          </div>
        )}

        {/* Authentication */}
        {isMinipApp && !user && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-center">
              <div className="text-3xl mb-2">🔐</div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Enhanced Experience
              </h3>
              <p className="text-sm text-blue-600 mb-4">
                Sign in to access personalized features and sync your events
              </p>
              <button
                onClick={handleQuickAuth}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Quick Auth
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <button
            onClick={openDashboard}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Open Dashboard
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Refresh Events
          </button>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
            <div>Context: {isMinipApp ? 'Mini App' : 'Browser'}</div>
            <div>User: {user ? JSON.stringify(user, null, 2) : 'None'}</div>
            <div>Events: {events.length}</div>
            <div>
              Wallet: {walletConnected ? walletAddress : 'Not connected'}
            </div>
            <div>Chain: {currentChain || 'Unknown'}</div>
            <div>Capabilities: {JSON.stringify(chainCapabilities)}</div>
          </div>
        )}
      </div>
    </div>
  )
}
