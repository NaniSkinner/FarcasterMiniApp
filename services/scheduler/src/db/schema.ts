import {
  pgTable,
  serial,
  varchar,
  text,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core'

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  contractAddress: varchar('contract_address', { length: 42 }).notNull(),
  eventSignature: text('event_signature').notNull(),
  eventArgs: jsonb('event_args').notNull(),
  nextTimestamp: timestamp('next_timestamp', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
})
