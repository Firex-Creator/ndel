// Local development PostgreSQL, run from npm so no system install is needed.
// Production uses a managed PostgreSQL instance via DATABASE_URL instead.
import EmbeddedPostgres from 'embedded-postgres'
import { existsSync } from 'node:fs'
import path from 'node:path'

const port = Number(process.env.DEV_DB_PORT ?? 5433)
const databaseDir = path.resolve('.local/pgdata')
const firstRun = !existsSync(databaseDir)

const pg = new EmbeddedPostgres({
  databaseDir,
  user: 'ndel',
  password: 'ndel-local-dev',
  port,
  persistent: true,
})

if (firstRun) await pg.initialise()
await pg.start()
if (firstRun) await pg.createDatabase('ndel')

console.log(`PostgreSQL running on localhost:${port} (database "ndel"). Press Ctrl+C to stop.`)

const stop = async () => {
  await pg.stop()
  process.exit(0)
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
