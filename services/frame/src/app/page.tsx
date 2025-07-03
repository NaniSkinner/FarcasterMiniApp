import { frames } from './frames'

export default function Home() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f0f0',
      }}
    >
      <h1 style={{ color: '#333', marginBottom: '20px' }}>🗓️ ChainCal Frame</h1>
      <p style={{ color: '#666', textAlign: 'center', maxWidth: '500px' }}>
        Your on-chain calendar reminders. This page serves as the Farcaster
        Frame for displaying upcoming events and managing reminders.
      </p>
      <div
        style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#e8f4f8',
          borderRadius: '8px',
          border: '1px solid #b3d9e8',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', color: '#2c5282' }}>
          Frame endpoint: <code>/api/frame</code>
        </p>
      </div>
    </div>
  )
}
