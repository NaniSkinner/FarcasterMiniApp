import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

async function main() {
  console.log('Running database migrations...')

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in the .env file')
  }

  // Use a long connection timeout for the migration client
  const migrationClient = postgres(process.env.DATABASE_URL, {
    max: 1,
    connect_timeout: 60,
  })

  try {
    await migrate(drizzle(migrationClient), { migrationsFolder: 'drizzle' })
    console.log('✅ Migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await migrationClient.end()
    console.log('Migration client disconnected.')
  }
}

main()
