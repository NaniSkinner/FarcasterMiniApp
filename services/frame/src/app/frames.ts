import { createFrames } from 'frames.js/next'

export const frames = createFrames({
  basePath: '/api/frame',
  debug: process.env.NODE_ENV === 'development',
})
