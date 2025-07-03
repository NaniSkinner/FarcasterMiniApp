import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
const envPath = path.join(__dirname, '../../../../.env')
console.log('Loading .env from:', envPath)
dotenv.config({
  path: envPath,
})

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

// Create the connection
const client = postgres(process.env.DATABASE_URL)
export const db = drizzle(client)

// Export the schema
export { events } from './schema'
