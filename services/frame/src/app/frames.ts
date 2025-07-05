import { createFrames } from 'frames.js/next'

export const frames = createFrames({
  basePath: '/api/frame',
  debug: process.env.NODE_ENV === 'development',
  // Enable user context and state management for Mini App functionality
  middleware: [
    // User context middleware can be added here if needed
  ],
})
