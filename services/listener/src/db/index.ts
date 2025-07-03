import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as dotenv from 'dotenv'
import * as schema from './schema'

dotenv.config({ path: '../../.env' })

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in the .env file')
}

// Use a long connection timeout for the client
const client = postgres(process.env.DATABASE_URL, { connect_timeout: 60 })
export const db = drizzle(client, { schema })
