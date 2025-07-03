import { drizzle } from 'drizzle-orm/postgres-js'
import { sql } from 'drizzle-orm'
import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

async function main() {
  console.log('🧪 Running Postgres connection test...')

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in the .env file')
  }

  const client = postgres(process.env.DATABASE_URL, { max: 1, ssl: 'require' })
  const db = drizzle(client)

  try {
    console.log('🚀 Connecting to database and running a test query...')
    await db.execute(sql`SELECT 1`)
    console.log('✅ Postgres connection successful!')
  } catch (error) {
    console.error('❌ Postgres connection failed:', error)
    process.exit(1)
  } finally {
    console.log('👋 Closing connection...')
    await client.end()
    console.log('✅ Connection closed.')
  }
}

main()
