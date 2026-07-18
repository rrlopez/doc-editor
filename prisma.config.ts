import 'dotenv/config'
import { defineConfig } from 'prisma/config'
import { buildPostgresUrl } from './src/lib/database-url'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx --env-file=.env ./prisma/seeders/index.ts',
  },
  datasource: {
    url: buildPostgresUrl(process.env['DIRECT_URL']),
  },
})
