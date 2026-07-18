import { execSync } from 'node:child_process'
import pg from 'pg'
import { buildPostgresUrl } from '../src/lib/database-url'

const MIGRATE_TICKET_CHANNEL_SQL = `
DO $$ BEGIN
  CREATE TYPE "TicketChannel" AS ENUM ('CALL', 'TEXT', 'MESSENGER', 'WALK_IN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "tickets" ALTER COLUMN "channel" DROP DEFAULT;

ALTER TABLE "tickets"
  ALTER COLUMN "channel" TYPE "TicketChannel"
  USING (
    CASE UPPER(REPLACE(TRIM("channel"), ' ', '_'))
      WHEN 'TEXT' THEN 'TEXT'::"TicketChannel"
      WHEN 'MESSENGER' THEN 'MESSENGER'::"TicketChannel"
      WHEN 'WALK_IN' THEN 'WALK_IN'::"TicketChannel"
      WHEN 'WALKIN' THEN 'WALK_IN'::"TicketChannel"
      ELSE 'CALL'::"TicketChannel"
    END
  );

ALTER TABLE "tickets" ALTER COLUMN "channel" SET DEFAULT 'CALL'::"TicketChannel";
`

async function migrateTicketChannelIfNeeded(client: pg.Client) {
  const { rows } = await client.query<{ udt_name: string }>(
    `SELECT udt_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'tickets'
       AND column_name = 'channel'`,
  )

  const column = rows[0]
  if (!column) return

  if (column.udt_name === 'TicketChannel') {
    console.info('✅ tickets.channel already uses TicketChannel enum.')
    return
  }

  console.info(`ℹ️  Migrating tickets.channel from ${column.udt_name} to TicketChannel enum...`)
  await client.query(MIGRATE_TICKET_CHANNEL_SQL)
  console.info('✅ tickets.channel enum migration completed.')
}

async function main() {
  const client = new pg.Client({ connectionString: buildPostgresUrl() })
  await client.connect()

  try {
    await migrateTicketChannelIfNeeded(client)
  } finally {
    await client.end()
  }

  execSync('pnpm exec prisma db push', { stdio: 'inherit' })
}

main().catch(error => {
  console.error('❌ Schema push failed:', error)
  process.exit(1)
})
