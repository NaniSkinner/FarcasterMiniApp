import Redis from 'ioredis'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../.env' })

async function main() {
  console.log('🧪 Running Redis connection test...')

  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is not set in the .env file')
  }

  const redis = new Redis(process.env.REDIS_URL)

  try {
    const testKey = 'chaincal:test'
    const testValue = `test-${Date.now()}`

    console.log('🚀 Connecting to Redis and running a test command...')
    await redis.set(testKey, testValue)
    console.log(`✅ Set key '${testKey}' to '${testValue}'`)

    const retrievedValue = await redis.get(testKey)
    if (retrievedValue !== testValue) {
      throw new Error(
        `Value mismatch: expected ${testValue}, got ${retrievedValue}`
      )
    }
    console.log(`✅ Retrieved and verified value for key '${testKey}'`)

    await redis.del(testKey)
    console.log(`✅ Cleaned up test key '${testKey}'`)

    console.log('✅ Redis connection successful!')
  } catch (error) {
    console.error('❌ Redis connection failed:', error)
    process.exit(1)
  } finally {
    console.log('👋 Closing connection...')
    redis.disconnect()
    console.log('✅ Connection closed.')
  }
}

main()
